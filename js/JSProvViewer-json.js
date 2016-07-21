function parse_entities(entities){
	for(key in entities){	
		var parent_id = undefined;
		if(entities[key]['rdt:name']!=undefined){
			var label = entities[key]['rdt:name']+' ['+entities[key]['rdt:type']+']';
		}else if( entities[key]['cf:pathname']!=undefined ){
			var label = '[path]'+entities[key]['cf:pathname'];
		}else if( entities[key]['cf:ifc']!=undefined ){
			var label = '[ifc]'+entities[key]['cf:ifc'];
		}else if(entities[key]['cf:node_info'] != undefined){
			var node_info = entities[key]['cf:node_info'];
			var label = '['+entities[key]['prov:type']+']'+node_info['cf:id'];
			var parent_id = node_info['cf:type'] + node_info['cf:id'] + node_info['cf:boot_id'] + node_info['cf:machine_id'];
			entity(parent_id, label);
			label = label+' v'+node_info['cf:version'];
		}else{
			var label = key;
		}
		
		if(entities[key]['prov:type']=='prov:agent'){
			agent(key, label, parent_id);
		}else{
			entity(key, label, parent_id);
		}
	}
}

function parse_activities(activities){
	for(key in activities){
		var parent_id = undefined;
		if(activities[key]['rdt:name']!=undefined){
			var label = activities[key]['rdt:name']+' ['+activities[key]['rdt:scriptLine']+']';
		}else if(activities[key]['cf:node_info'] != undefined){
			var node_info = activities[key]['cf:node_info'];
			var label = node_info['cf:id'];
			parent_id = node_info['cf:type'] + node_info['cf:id'] + node_info['cf:boot_id'] + node_info['cf:machine_id'];
			activity(parent_id, label);
			label = label+' v'+node_info['cf:version'];
		}else{
			var label = key;
		}
		
		activity(key, label, parent_id);
	}
}

function parse_agents(agents){
	for(key in agents){
		agent(key);
	}
}



function JSProvParseJSON(text){
	var data = JSON.parse(text);
	parse_entities(data.entity);
	parse_activities(data.activity);
	parse_agents(data.agent);
	
	generated = data.wasGeneratedBy;
	for(key in generated){
		wasGeneratedBy(generated[key]['prov:entity'], generated[key]['prov:activity']);
	}
	associated = data.wasAssociatedWith;
	for(key in associated){
		wasAssociatedWith(associated[key]['prov:activity'], associated[key]['prov:agent']);
		if(associated[key]['prov:plan']!=undefined){
			hadPlan(associated[key]['prov:agent'], associated[key]['prov:plan'])
		}
	}	
	_used = data.used;
	for(key in _used){
		used(_used[key]['prov:activity'], _used[key]['prov:entity']);
	}
	derived = data.wasDerivedFrom;
	for(key in derived){
		wasDerivedFrom(derived[key]['prov:generatedEntity'], derived[key]['prov:usedEntity']);
	}
	attributed = data.wasAttributedTo;
	for(key in attributed){
		wasAttributedTo(attributed[key]['prov:entity'], attributed[key]['prov:agent']);
	}
	
	informed = data.wasInformedBy;
	for(key in informed){
		wasInformedBy(informed[key]['prov:informant'], informed[key]['prov:informed']);
	}
	
	derived = data.derivedByInsertionFrom;
	for(key in derived){
		derivedByInsertionFrom(derived[key]['prov:before'], derived[key]['prov:after']);
		for(i=0; i < derived[key]['prov:key-entity-set'].length; i++){
			hadDictionaryMember(derived[key]['prov:after'], derived[key]['prov:key-entity-set'][i][1]);
		}
	}
	specialization = data.specializationOf;
	for(key in specialization){
		specializationOf(specialization[key]['prov:entity'], specialization[key]['prov:specialization']);
	}
	alternate = data.alternateOf;
	for(key in alternate){
		alternateOf(alternate[key]['prov:entity'], alternate[key]['prov:alternate']);
	}
	edge = data.edge;
	for(key in edge){
		entity(edge[key]['cf:sender'], 'was missing');
		entity(edge[key]['cf:receiver'], 'was missing');
		unknownEdge(edge[key]['cf:receiver'], edge[key]['cf:sender'])
	}
	JSProvDraw();
}
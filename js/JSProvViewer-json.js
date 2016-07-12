function JSProvParseJSON(text){
	var data = JSON.parse(text);
	entities = data.entity;
	for(key in entities){
		entity(key);
	}
	activities = data.activity;
	console.log(activities);
	for(key in activities){
		activity(key);
	}
	agents = data.agent;
	for(key in agents){
		agent(key);
	}
	generated = data.wasGeneratedBy;
	for(key in generated){
		wasGeneratedBy(generated[key]['prov:entity'], generated[key]['prov:activity']);
	}
	associated = data.wasAssociatedWith;
	for(key in associated){
		wasAssociatedWith(associated[key]['prov:activity'], associated[key]['prov:agent']);
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
}
var graphType = 'dagre';
var previously_selected = undefined;
var showAncestors=true;
var showSuccessors=true;

$(function(){
	var cy = window.cy = cytoscape({
		container: document.getElementById('cy'),

		boxSelectionEnabled: false,

		layout: {
			name: 'dagre'
		},

		style: [
			{
				selector: 'node',
				style: {
					'content': 'data(id)',
					'text-opacity': 0.5,
					'text-valign': 'center',
					'text-halign': 'right',
					'background-color': 'data(color)',
					'shape': 'data(shape)'
				}
			},

			{
				selector: 'edge',
				style: {
					'label': 'data(label)',
					'edge-text-rotation': 'autorotate',
					'text-wrap': 'wrap',
					'width': 3,
					'length': 100,
					'source-arrow-shape': 'triangle',
					'line-color': 'data(color)',
					'source-arrow-color': 'data(color)',
					'curve-style': 'bezier',
					'control-point-step-size': 40,
					'font-size': 6,
					'text-outline-color': '#FFFFFF',
					'text-outline-width': 1,
				}
			},			
			{
			  selector: ':parent',
			  style: {
				'background-opacity': 0.333
			  }
			},
			{
				selector: ':selected',
				style: {
					'border-width': 3,
					'border-color': '#333'
				}
			},
			{
				selector: '.faded',
				style: {
					'opacity': 0.1
				}
			}
			,
			{
				selector: 'node.prov_successor',
				style: {
					'border-width': 3,
					'border-color': 'blue'
				}
			}
			,
			{
				selector: 'node.prov_ancestor',
				style: {
					'border-width': 3,
					'border-color': 'red'
				}
			}
		]
	});
	
	cy.on('tap', function(evt){
		cy.elements().removeClass('faded');
		cy.elements().removeClass('prov_successor');
		cy.elements().removeClass('prov_ancestor');
	});
	
	cy.on('tap', 'node', function(evt){
		var node = evt.cyTarget;
		cy.elements().addClass('faded');
		cy.elements().removeClass('prov_successor');
		cy.elements().removeClass('prov_ancestor');
		node.removeClass('faded');
		
		
		
		if(showSuccessors){
			var successors = [node];
			var visited = [node.id()];
			while(successors.length>0 && successors.length<100){
				current = successors.pop();
				current.openNeighborhood('edge[source="'+current.id()+'"]').each(function(i, edge){
					edge.removeClass('faded');
					newNode = edge.target();
					newNode.addClass('prov_successor');
					newNode.removeClass('faded');
					if(!visited.includes(newNode.id())){
						visited.push(newNode.id());
						successors.push(newNode);
					}
				});
			}
			if(successors.length>=5000){
				alert("Something is wrong, check for cycle. Provenance graph MUST NOT contain cycle.");
			}
		}
		
		if(showAncestors){
			var ancestors = [node];
			var visited = [node.id()];
			while(ancestors.length>0 && ancestors.length<5000){
				current = ancestors.pop();
				current.openNeighborhood('edge[target="'+current.id()+'"]').each(function(i, edge){
					edge.removeClass('faded');
					newNode = edge.source();
					newNode.addClass('prov_ancestor');
					newNode.removeClass('faded');
					if(!visited.includes(newNode.id())){
						visited.push(newNode.id());
						ancestors.push(newNode);
					}
				});
			}
			if(ancestors.length>=5000){
				alert("Something is wrong, check for cycle. Provenance graph MUST NOT contain cycle.");
			}
		}
	});
});

function JSProvDraw(){
	var layout = cy.makeLayout({
		name: graphType
	});
	layout.run();
}

function JSProvGetGraphType(){
	return graphType;
}

function JSProvSetGraphType(type){
	graphType = type;
}

function JSProvSetShowAncestors(bool){
	showAncestors=bool;
}

function JSProvSetShowSuccessors(bool){
	showSuccessors=bool;
}

function location(name){
	cy.add([{ group: "nodes", data: { id: name, color: '#66B2FF', shape: 'rectangle'}}]);				
}

function activity(name, location){				
	if (typeof location === 'undefined')
		cy.add([{ group: "nodes", data: { id: name, color: '#66B2FF', shape: 'rectangle'}}]);
	else
		cy.add([{ group: "nodes", data: { id: name, parent: location, color: '#0000FF', shape: 'rectangle'}}]);
}

function entity(name, location){
	if (typeof location === 'undefined')
		cy.add([{ group: "nodes", data: { id: name, color: '#FFB266', shape: 'ellipse'}}]);
	else
		cy.add([{ group: "nodes", data: { id: name, parent: location, color: '#FFB266', shape: 'ellipse'}}]);
}

function agent(name, location){
	if (typeof location === 'undefined')
		cy.add([{ group: "nodes", data: { id: name, color: '#66FF66', shape: 'octagon'}}]);
	else
		cy.add([{ group: "nodes", data: { id: name, parent: location, color: '#66FF66', shape: 'octagon'}}]);
}

function wasDerivedFrom(generatedEntity, usedEntity){
	cy.add([{ group: "edges", data: { source: usedEntity, target: generatedEntity, color: '#FF0000', label: 'wasDerivedFrom'}}]);
}

function wasGeneratedBy(entity, activity){
	cy.add([{ group: "edges", data: { source: activity, target: entity, color: '#0000FF', label: 'wasGeneratedBy'}}]);
}

function wasAssociatedWith(activity, agent){
	cy.add([{ group: "edges", data: { source: agent, target: activity, color: '#00CCCC', label: 'wasAssociatedWith'}}]);
}

function used(entity, activity){
	cy.add([{ group: "edges", data: { source: activity, target: entity, color: '#00FF00', label: 'used'}}]);
}

function wasAttributedTo(entity, agent){
	cy.add([{ group: "edges", data: { source: agent, target: entity, color: '#00CCCC', label: 'wasAttributedTo'}}]);
}

function actedOnBehalfOf(acted, of){
	cy.add([{ group: "edges", data: { source: acted, target: of, color: '#CC00CC', label: 'actedOnBehalfOf'}}]);
}

function wasInformedBy(entityInformant, entityInformed){
	cy.add([{ group: "edges", data: { source: entityInformant, target: entityInformed, color: '#CC00CC', label: 'wasInformedBy'}}]);
}

function derivedByInsertionFrom(before, after){
	cy.add([{ group: "edges", data: { source: before, target: after, color: '#CC00CC', label: 'derivedByInsertionFrom'}}]);
}

function hadDictionaryMember(dictionary, entry){
	cy.add([{ group: "edges", data: { source: entry, target: dictionary, color: '#CC00CC', label: 'hadDictionaryMember'}}]);
}

function specializationOf(entity, specialization){
	cy.add([{ group: "edges", data: { source: entity, target: specialization, color: '#CC00CC', label: 'specializationOf'}}]);
}

function alternateOf(entity, alternate){
	cy.add([{ group: "edges", data: { source: entity, target: alternate, color: '#CC00CC', label: 'alternateOf'}}]);
}

function hadPlan(agent, plan){
	cy.add([{ group: "edges", data: { source: plan, target: agent, color: '#CC00CC', label: 'hadPlan'}}]);	
}
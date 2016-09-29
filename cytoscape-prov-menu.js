var __last_removed;
var prov_menu = {
	  selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
	  atMouse: true, // draw menu at mouse position
	  commands: [ // an array of commands to list in the menu or a function that returns the array
		{ // delete
		  fillColor: 'rgba(106,90,205, 0.9)', // optional: custom background color for item
		  content: '<img src="https://cdn2.iconfinder.com/data/icons/designers-and-developers-icon-set/32/recyclebin-128.png" alt="delete" height="42" width="42">', // html/text content to be displayed in the menu
		  select: function(ele){ // a function to execute when the command is selected
			__last_removed = cy.remove( ele );
		  },
		  disabled: false // disables the item on true
		},
		{ // details
		  fillColor: 'rgba(90,106,40, 0.9)', // optional: custom background color for item
		  content: '<img src="http://image.flaticon.com/icons/svg/33/33634.svg" alt="details" height="42" width="42">', // html/text content to be displayed in the menu
		  select: function(ele){ // a function to execute when the command is selected
			// TODO complexify.
			var txt = '<h3>' + ele.data("label") + '</h3>';
			txt += '<b>id</b>='+ele.data('id')+'<br/>';
			json = ele.data('json');
			for (var key in json){
				txt += '<b>'+key+'</b>='+JSON.stringify(json[key])+'<br/>';
			}
			vex.dialog.alert({ unsafeMessage: '<div style="word-break: break-all;">'+txt+'</div>'});
		  },
		  disabled: false // disables the item on true
		},
		{ // collapse
		  fillColor: 'rgba(90,40,106, 0.9)', // optional: custom background color for item
		  content: '<img src="http://image.flaticon.com/icons/svg/149/149184.svg" alt="collapse" height="42" width="42">', // html/text content to be displayed in the menu
		  select: function(ele){ // a function to execute when the command is selected
			cy.prov_core().collapse(ele);
		  },
		  disabled: false // disables the item on true
		},
		{ // uncollapse
		  fillColor: 'rgba(40,106,90, 0.9)', // optional: custom background color for item
		  content: '<img src="http://image.flaticon.com/icons/svg/149/149185.svg" alt="collapse" height="42" width="42">', // html/text content to be displayed in the menu
		  select: function(ele){ // a function to execute when the command is selected
			cy.prov_core().uncollapse(ele);
		  },
		  disabled: false // disables the item on true
		}
	  ]
};

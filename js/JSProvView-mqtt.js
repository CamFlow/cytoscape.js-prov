var clientId = "ws" + Math.random();
// Create a client instance
var client = new Paho.MQTT.Client("m12.cloudmqtt.com", 37065, clientId);

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// called when the client connects
function onConnect() {
	// Once a connection has been made, make a subscription and send a message.
	console.log("Connected!");
	client.subscribe("#");
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
	if (responseObject.errorCode !== 0) {
		console.log("onConnectionLost:", responseObject.errorMessage);
		setTimeout(function() { client.connect() }, 5000);
	}
}

// called when a message arrives
function onMessageArrived(message) {
	JSProvParseJSON(message.payloadString);
}

function onFailure(invocationContext, errorCode, errorMessage) {
	alert(errorMessage);
}

function JSProvMQTTConnect(){	
	client.connect({
					useSSL: true,
					userName: "camflow",
					password: "test",
					onSuccess: onConnect,
					onFailure: onFailure
				});
}


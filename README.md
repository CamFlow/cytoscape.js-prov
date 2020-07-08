# cytoscape.js-prov

[![DOI](https://zenodo.org/badge/63157759.svg)](https://zenodo.org/badge/latestdoi/63157759)

This is an extension to support W3C-Prov in cytoscape JS. Check [here](http://camflow.org/demo) for a live demo.

WARNING: work in progress, not ready for release.

## How to visualise a simple provenance graph

This assumes that CamFlow has been installed and that it is working properly on a Fedora machine. More information on how do so is [available](https://camflow.org/#installation).

1 - you need to install CamQuery, as follow:
```
sudo dnf install ruby
gem install camtool
```

2 - you need to build the example programs:
```
git clone https://github.com/camflow/examples
cd examples
make all
```

3 - you need to check you configuration, in particular setting up [camflowd](https://camflow.org/#overview) correctly:
```
sudo dnf install nano
sudo nano /etc/camflowd.ini
```

`output` and `format` parameters must be set as follow:
```
output=log
format=w3c
```

If you changed those parameters you must reboot the machine.

4 - You can test that everything is working by doing:
```
cat /tmp/audit.log
```

This should display a json text describing the host machine.

5 - turn on the visulisation tool in your browser. Open [camflow.org/demo](https://camflow.org/demo) in your browser and click on `Start CamFlow MQTT`. Do not close the tab.

6 - Execute an example program:
```
cd examples
./provenance/tcp-client.o www.google.com 80
```

7 - publish the provenance data to be visualised
```
camtool --publish /tmp/audit.log
```

8 - visualise the graph in the tab where [camflow.org/demo](https://camflow.org/demo) is open.

## ocelot-online

OpenComputers emulator in form of a web-application.  
Uses the `ocelot-brain` module to do all the emulation work under the hood.  

### demo

Demo build can be tested here: [https://ocelot.fomalhaut.me/](https://ocelot.fomalhaut.me/)

It consists of a single shared computer instance
with the following configuration:

* Creative computer case
* CPU (Tier 3)
* Graphics card (Tier 3)
* 2x Memory planks (Tier 3.5)
* HDD, managed (Tier 3)
* HDD, unmanaged (Tier 3)
* Internet card
* Redstone card (Tier 2)
* Disk drive with OpenOS installation floppy inserted
* EEPROM with advanced OS loader
* Screen (Tier 2)
* Keyboard

### build instructions
#### frontend
* Install [rollup.js](https://rollupjs.org/guide/en/)
* Run `rollup -c` command from the project directory
* The `static/js/ocelot.js` will be generated
* Take the whole `static` folder
#### backend
* Import the project into your favorite IDE with the last Scala and SBT installed
* Pull the `ocelot-brain` submodule
* Run `sbt assembly` task to build the server-side to a JAR file with dependencies
* Take the JAR file from `target/scala-x.xx/` folder

### how to run
* Make sure that the project directory contains Ocelot Online JAR file, the `static` folder, and the `ocelot.conf` file
* (The `brain.conf` file for Ocelot Brain is optional)
* Run Ocelot using `java -jar ocelot-online-x.x.x.jar` command

### disclaimer
This project is a *work-in-progress*, breaking changes and bugs will break
things from time to time.

Beware.

## ocelot-online

OpenComputers emulator in form of a web-application.  
Uses `ocelot-brain` module to do all the emulation work under the hood.  

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

* Import the project into your favorite IDE with the last Scala and SBT installed
* Put a compiled `ocelot-brain` JAR file into `lib/` directory (create it if necessary)
* Run `sbt assembly` task to package the project to a JAR file with dependencies
* Take the JAR file from `target/scala-x.xx/` folder
* Run it using `java -jar ocelot-online-x.x.x.jar` command

The working directory of ocelot.online instance must contain the `static/`
folder from this repo and the configured `ocelot.conf` file.  
Also, you can put there a `brain.conf` file to configure the emulator core.
This config file is just a copy of OpenComputers configuration.

**P.S.** This project is a *work-in-progress*, breaking changes and bugs will break
things from time to time. Beware.

name := "ocelot-online"

version := "0.1.0"

scalaVersion := "2.12.6"

libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-http"   % "10.1.5",
  "com.typesafe.akka" %% "akka-stream" % "2.5.16",
  "com.typesafe" % "config" % "1.3.3"
)

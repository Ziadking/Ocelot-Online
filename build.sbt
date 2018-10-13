name := "ocelot-online"

// do not forget to change version in Ocelot.scala
version := "0.3.4"

scalaVersion := "2.12.6"

libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-http"   % "10.1.5",
  "com.typesafe.akka" %% "akka-stream" % "2.5.16",
  "com.typesafe" % "config" % "1.3.3"
)

assemblyJarName := s"ocelot-online-${version.value}.jar"

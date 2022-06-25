name := "ocelot-online"

// do not forget to change version in Ocelot.scala
version := "0.5.0"

scalaVersion := "2.13.8"

lazy val root = project.in(file("."))
  .dependsOn(brain % "compile->compile")
  .aggregate(brain)

lazy val brain = ProjectRef(file("lib/ocelot-brain"), "ocelot-brain")

libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-http"   % "10.2.9",
  "com.typesafe.akka" %% "akka-stream" % "2.6.19",
  "com.typesafe" % "config" % "1.4.2",
  "org.scalatra.scalate" %% "scalate-core" % "1.9.8",
  "io.spray" %%  "spray-json" % "1.3.6"
)

assemblyJarName := s"ocelot-online-${version.value}.jar"

assemblyMergeStrategy in assembly := {
  case PathList("META-INF", "MANIFEST.MF") => MergeStrategy.discard
  case "reference.conf" => MergeStrategy.concat
  case _ => MergeStrategy.first
}
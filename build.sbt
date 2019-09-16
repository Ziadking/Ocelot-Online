name := "ocelot-online"

// do not forget to change version in Ocelot.scala
version := "0.3.8"

scalaVersion := "2.13.0"

lazy val root = project.in(file("."))
  .dependsOn(brain % "compile->compile")
  .aggregate(brain)

lazy val brain = ProjectRef(file("lib/ocelot-brain"), "ocelot-brain")

libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-http"   % "10.1.9",
  "com.typesafe.akka" %% "akka-stream" % "2.5.25",
  "com.typesafe" % "config" % "1.3.4"
)

assemblyJarName := s"ocelot-online-${version.value}.jar"

assemblyMergeStrategy in assembly := {
  case PathList("META-INF", "MANIFEST.MF") => MergeStrategy.discard
  case "reference.conf" => MergeStrategy.concat
  case _ => MergeStrategy.first
}

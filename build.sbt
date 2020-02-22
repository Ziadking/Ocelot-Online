name := "ocelot-online"

// do not forget to change version in Ocelot.scala
version := "0.3.11"

scalaVersion := "2.13.1"

lazy val root = project.in(file("."))
  .dependsOn(brain % "compile->compile")
  .aggregate(brain)

lazy val brain = ProjectRef(file("lib/ocelot-brain"), "ocelot-brain")

libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-http"   % "10.1.11",
  "com.typesafe.akka" %% "akka-stream" % "2.6.3",
  "com.typesafe" % "config" % "1.4.0"
)

assemblyJarName := s"ocelot-online-${version.value}.jar"

assemblyMergeStrategy in assembly := {
  case PathList("META-INF", "MANIFEST.MF") => MergeStrategy.discard
  case "reference.conf" => MergeStrategy.concat
  case _ => MergeStrategy.first
}

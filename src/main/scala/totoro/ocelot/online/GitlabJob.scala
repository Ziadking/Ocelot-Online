package totoro.ocelot.online

import spray.json.DefaultJsonProtocol
import spray.json.DefaultJsonProtocol.{StringJsonFormat, jsonFormat1, jsonFormat5, listFormat}

case class GitlabJob(commit: Commit)
case class Commit(id: String, web_url: String, authored_date: String, author_name: String, short_id: String)

object GitlabJob extends DefaultJsonProtocol {
  implicit val commitFormat = jsonFormat5(Commit)
  implicit val gitlabJobFormat = jsonFormat1(GitlabJob.apply)
}
package totoro.ocelot.online

import scala.util.Random

object NameGen {
  private val consonants = Array(
    'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n','p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z'
  )
  private val vowels = Array('a', 'e', 'i', 'o', 'u')
  private val syllables = Array(
    (true, false, null, null),
    (true, false, true, null),
    (false, true, null, null),
    (false, true, false, null),
    (false, null, null, null),
    (true, true, false, null),
    (true, false, false, null)
  )
  private val MaxSyllables = 5

  def name(seed: Int): String = {
    val random = new Random(seed)
    val builder = new StringBuilder()
    val number = random.nextInt(MaxSyllables - 1) + 1
    for (_ <- 1 to number) {
      val pattern = syllables(random.nextInt(syllables.length))
      pattern.productIterator.foreach {
        case flag: Boolean =>
          if (flag) builder += consonants(random.nextInt(consonants.length))
          else builder += vowels(random.nextInt(vowels.length))
        case _ =>
      }
    }
    builder.result()
  }
}

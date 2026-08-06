import { SiteHeader } from "../SiteHeader";

function SentenceSpace() {
  return <span className="sentence-gap">{"\u00A0"}</span>;
}

export default function AboutPage() {
  return (
    <main className="subpage about-page">
      <SiteHeader showHome />
      <div className="about-simple">
        <h1 className="page-title">About myself</h1>

        <article className="about-copy">
          <p>
            I was born in Little Rock, Arkansas.<SentenceSpace />I have a
            wonderful family: my wife, Janet, a famous horticulturist; son Kyle,
            a fantastic chef; daughter Katie, a child care worker for children
            with special needs; and her husband, Benjamin, who works for UAMS,
            is a great problem-solver and is a great help to me.
          </p>
          <p>
            And, of course, their son, Christian Ryan Muller—the center of our
            universe.
          </p>
          <p>
            I learned photography in high school alongside my best friends,
            Barry Arthur and Alex Brandon.<SentenceSpace />My first newspaper
            job was as a stringer for the Arkansas Gazette, and I soon joined
            the staff of the Arkansas Democrat.<SentenceSpace />What a wonderful
            job it was.<SentenceSpace />From a front-row seat, I witnessed and
            documented the history of Arkansas, photographing an extraordinary
            range of people, places, and events.
          </p>
          <p>
            Unfortunately, all but a few of those images are now gone.
            <SentenceSpace />I am sure they look better in my memory than they
            did in fact.
          </p>
          <p>
            We started inventing the process of digitizing photographs.
            <SentenceSpace />We would still process film, but then scan it into
            a computer for editing and output.<SentenceSpace />Easy today but
            back in the 1980s it resembled magic.<SentenceSpace />The process
            was slow and tedious but it got better.<SentenceSpace />This was
            important because it was the biggest hurdle to pagination, total
            page layout with computers.
          </p>
          <p>
            In 1991, I moved into information technology.<SentenceSpace />Over
            the years, we developed and installed more systems than I could
            possibly list.
          </p>
          <p>
            I was blessed to work with my best friends.<SentenceSpace />Barry
            now works for our parent company, WEHCO Media, where he helps
            coordinate and solve problems across its digital presence.
            <SentenceSpace />Alex went on to several positions before becoming
            a staff photographer in Washington, D.C., covering the White House.
            <SentenceSpace />Someday, I hope to write a more detailed account of
            their accomplishments; it will be good reading.
          </p>
          <p>
            Years later, in the digital era, I returned to photography by
            covering mainly sports—my favorite subject.<SentenceSpace />I went
            to a lot of Razorback football games, which was considered the
            choice assignment but I found that High School sports was much more
            rewarding, the opposite of how I felt early in my career.
            <SentenceSpace />I also love UALR basketball.<SentenceSpace />I had
            great access to the team, went to most of their home games and
            traveled to the Sun Belt tournament.
          </p>
          <p>
            After 42 years at the newspaper, I retired.<SentenceSpace />A friend
            reminded me of my love for film photography, and that is where my
            attention has returned.
          </p>
          <p>
            My favorite subject, of course, is Christian.<SentenceSpace />He is
            now two years old, and I have more than 3,000 photographs of him
            that survived my first round of editing.<SentenceSpace />Among those
            are a few I think are genuinely good—and many others I simply enjoy.
            <SentenceSpace />You will see some of them here.
          </p>
          <p>Enjoy!</p>
        </article>
      </div>
    </main>
  );
}

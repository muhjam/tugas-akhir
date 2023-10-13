import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  
  const [ textInput, setTextInput ] = useState( "" );
  const [ qty, setQty ] = useState( 0 );
  const [difficulty, setDifficulty] = useState("");
  const [ result, setResult ] = useState( [] );
  const [resultList, setResultList] = useState("");
  const [ isSubmitting, setIsSubmitting ] = useState( false );
  const [ isSubmittingList, setIsSubmittingList ] = useState( false );
  const dataJson = result.length === 0 ? [] : JSON.parse( result );

  async function onSubmit(event) {
    event.preventDefault();
    setIsSubmitting( true );
    var apiGenerte = null;
    try
    {
    switch ( difficulty )
    {
      case "easy":
        apiGenerte = "/api/generateEasy";
        break;
      case "medium":
        apiGenerte = "/api/generateMedium";
        break;
      case "hard":
        apiGenerte = "/api/generateHard";
        break;
      case "elite":
        apiGenerte = "/api/generateElite";
        break;
      default:
        apiGenerte = "/api/generateEasy";
        break;
    }
      const response = await fetch( apiGenerte , {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: textInput}),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      // setTextInput("");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsSubmitting(false); 
    }
  }

  async function onSubmitList ( event )
  {
    event.preventDefault();
    setIsSubmittingList( true );
    try
    {
      const response = await fetch( "/api/generateList" , {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: textInput, difficulty: difficulty, qty: qty}),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResultList(data.result);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsSubmittingList( false ); 
    }
  }
  
  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/quest.png" />
      </Head>
    {/* generate list */}
      <main className={styles.main}>
        <img src="/quest.png" className={styles.icon} />
        <h3>Question List</h3>
        <form onSubmit={ onSubmitList }>
          <div className={ styles.card }>
                <input
            type="number"
            name="qty"
            placeholder="Enter a number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
            <select
              name="difficulty"
              className="selection"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)} 
            >
              <option value="difficulty level easy">Easy</option>
              <option value="difficulty level medium">Medium</option>
              <option value="difficulty level hard">Hard</option>
              <option value="difficulty level elite">elite</option>
            </select>
          </div>
          <input
            type="text"
            name="text"
            placeholder="Enter a text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <input
            type="submit"
            value="Generate list"
            className={isSubmittingList ? styles.submitting : styles.normal}
            />
        </form>
        <div className={ styles.result }>
            {resultList.length !== 0 ? (
              <p className={styles.text}>{ resultList }</p>
            ) : null}
        </div>
      </main>
      {/* generate quest */}
      <main className={styles.main}>
        <img src="/quest.png" className={styles.icon} />
        <h3>Question Title</h3>
        <form onSubmit={onSubmit}>
            <select
              name="difficulty"
              className="selection"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)} 
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="elite">Elite</option>
            </select>
          <input
            type="text"
            name="text"
            placeholder="Enter a text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <input
            type="submit"
            value="Generate question"
            className={isSubmitting ? styles.submitting : styles.normal}
          />
        </form>
        <div className={ styles.result }>
          {result.length !== 0 ? (
              <div>
                <h1 className={styles.text}>Judul: {dataJson[ 0 ].title}</h1>
                <p className={styles.text}>{dataJson[ 0 ].description}</p>
                {console.log(dataJson)}
              </div>
)        : null}
        </div>
      </main>
    </div>
  );
}

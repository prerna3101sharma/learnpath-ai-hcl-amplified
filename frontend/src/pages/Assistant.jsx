import Chatbot from "../components/Chatbot";


function Assistant() {

  return (

    <div className="page">

      <div className="page-header">

        <p className="eyebrow">
          AI LEARNING ASSISTANT
        </p>

        <h1>
          Ask LearnPath AI
        </h1>

        <p>
          Get personalized answers about
          your learning journey.
        </p>

      </div>


      <Chatbot
        userId={1}
      />

    </div>

  );
}

export default Assistant;
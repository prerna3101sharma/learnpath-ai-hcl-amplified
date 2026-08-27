function ProgressBar({
  percentage = 0
}) {

  return (

    <div className="progress-wrapper">

      <div className="progress-info">

        <span>
          Overall Progress
        </span>

        <strong>
          {Math.round(
            percentage
          )}%
        </strong>

      </div>


      <div className="progress-track">

        <div
          className="progress-fill"
          style={{
            width:
              `${percentage}%`
          }}
        />

      </div>

    </div>

  );
}


export default ProgressBar;
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Clock,
} from "lucide-react";


function LearningPath({
  path,
}) {

  if (!path?.items?.length) {

    return (

      <div className="empty-state">
        No learning path available.
      </div>

    );

  }


  return (

    <div className="path-card">

      <div className="section-header">

        <div>

          <h3>
            Your Learning Path
          </h3>

          <p>
            Personalized roadmap
          </p>

        </div>

        <span className="path-duration">

          {path.estimated_weeks} weeks

        </span>

      </div>


      <div className="timeline">

        {path.items.map(
          (item, index) => {

            const completed =
              item.status ===
              "Completed";

            const next =
              item.status ===
              "Next";


            return (

              <div
                className="timeline-item"
                key={item.course_id}
              >

                <div className="timeline-icon">

                  {completed ? (

                    <CheckCircle2
                      size={24}
                    />

                  ) : next ? (

                    <ArrowRight
                      size={24}
                    />

                  ) : (

                    <Circle
                      size={22}
                    />

                  )}

                </div>


                <div className="timeline-content">

                  <div className="timeline-top">

                    <span className="skill-tag">

                      {item.skill_name}

                    </span>

                    {next && (
                      <span className="next-tag">
                        NEXT
                      </span>
                    )}

                  </div>


                  <h4>
                    {item.course_title}
                  </h4>


                  <p>
                    {item.objective}
                  </p>


                  <div className="course-meta">

                    <span>

                      <Clock
                        size={15}
                      />

                      {item.estimated_hours}
                      {" "}hours

                    </span>

                    <span>
                      {item.difficulty}
                    </span>

                  </div>


                  <div className="recommendation-reason">

                    <strong>
                      Why this?
                    </strong>

                    <span>
                      {item.reason}
                    </span>

                  </div>

                </div>

              </div>

            );

          }
        )}

      </div>

    </div>

  );
}

export default LearningPath;
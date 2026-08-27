import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

function SkillGapChart({
  skills = [],
  progress = [],
  courses = [],
}) {

  /*
   * Create lookup table:
   *
   * course_id -> progress %
   */
  const progressMap = {};

  progress.forEach((record) => {

    const courseId =
      record.course_id ??
      record.courseId;

    if (courseId == null) {
      return;
    }

    progressMap[courseId] = Number(
      record.progress_percentage ??
        record.progressPercentage ??
        record.progress ??
        0
    );

  });


  /*
   * Course lookup.
   */
  const courseMap = {};

  courses.forEach((course) => {

    const id =
      course.id ??
      course.course_id;

    if (id != null) {
      courseMap[id] = course;
    }

  });


  /*
   * Calculate current skill level.
   *
   * If the backend skill-gap API already supplies
   * a current level, use it as a fallback.
   */
  const chartData = skills.map((skill) => {

    const skillName =
      skill.skill_name ??
      skill.skill ??
      skill.name ??
      "Skill";

    const requiredLevel = Number(
      skill.required_level ??
        skill.requiredLevel ??
        4
    );

    let currentLevel = Number(
      skill.current_level ??
        skill.currentLevel ??
        0
    );

    /*
     * Find progress records associated with
     * this skill.
     */
    const relatedProgress = [];

    progress.forEach((record) => {

      const courseId =
        record.course_id ??
        record.courseId;

      const course =
        courseMap[courseId];

      if (!course) {
        return;
      }

      const courseSkill =
        course.skill_name ??
        course.skill ??
        course.skillName;

      if (!courseSkill) {
        return;
      }

      if (
        courseSkill.toLowerCase() ===
        skillName.toLowerCase()
      ) {
        relatedProgress.push(
          Number(
            record.progress_percentage ??
              record.progressPercentage ??
              record.progress ??
              0
          )
        );
      }

    });


    /*
     * Convert course progress percentage
     * into a 0-5 skill scale.
     */
    if (relatedProgress.length > 0) {

      const averageProgress =
        relatedProgress.reduce(
          (sum, value) => sum + value,
          0
        ) / relatedProgress.length;

      currentLevel = Number(
        (
          (averageProgress / 100) *
          requiredLevel
        ).toFixed(1)
      );

    }


    return {
      skill: skillName,
      current: currentLevel,
      required: requiredLevel,
    };

  });


  /*
   * Empty state.
   */
  if (chartData.length === 0) {
    return (
      <div className="skill-gap-card">

        <div className="section-header">
          <div>
            <h3>Skill Development</h3>
            <p>
              Current vs required proficiency
            </p>
          </div>
        </div>

        <div className="empty-state">
          No skill development data available.
        </div>

      </div>
    );
  }


  return (
    <div className="skill-gap-card">

      <div className="section-header">

        <div>
          <h3>
            Skill Development
          </h3>

          <p>
            Current vs required proficiency
          </p>
        </div>

      </div>


      <div className="chart-container">

        <ResponsiveContainer
          width="100%"
          height={330}
        >

          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              top: 10,
              right: 20,
              left: 80,
              bottom: 10,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
            />

            <XAxis
              type="number"
              domain={[
                0,
                "dataMax + 1"
              ]}
              allowDecimals={false}
            />

            <YAxis
              type="category"
              dataKey="skill"
              width={110}
            />

            <Tooltip
              formatter={(value, name) => [
                value,
                name === "current"
                  ? "Current Level"
                  : "Required Level",
              ]}
            />

            <Legend />

            <Bar
              dataKey="current"
              name="Current"
              radius={[0, 5, 5, 0]}
            />

            <Bar
              dataKey="required"
              name="Required"
              radius={[0, 5, 5, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default SkillGapChart;
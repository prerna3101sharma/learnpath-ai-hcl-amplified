import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";


function SkillGapChart({
  skills = [],
}) {

  const data = skills.map(
    (skill) => ({
      name: skill.skill_name,
      current:
        skill.current_level || 0,
      required:
        skill.required_level || 0,
    })
  );


  return (

    <div className="chart-card">

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
          height={300}
        >

          <BarChart
            data={data}
            layout="vertical"
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              type="number"
              domain={[0, 5]}
            />

            <YAxis
              type="category"
              dataKey="name"
              width={110}
            />

            <Tooltip />

            <Bar
              dataKey="current"
              name="Current"
              radius={[0, 4, 4, 0]}
            />

            <Bar
              dataKey="required"
              name="Required"
              radius={[0, 4, 4, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>

  );
}

export default SkillGapChart;
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}) {

  return (

    <div className="stat-card">

      <div className="stat-header">

        <span>
          {title}
        </span>

        {Icon && (
          <div className="stat-icon">
            <Icon size={20} />
          </div>
        )}

      </div>

      <h2>
        {value}
      </h2>

      {subtitle && (
        <p>
          {subtitle}
        </p>
      )}

    </div>

  );
}

export default StatCard;
import React, { useMemo } from 'react';
import { TrendingUp, Users, Calendar, Award } from 'lucide-react';
import { format, parseISO, isPast, isThisMonth, isThisYear } from 'date-fns';

const Analytics = ({ events, categories }) => {
  const analytics = useMemo(() => {
    const totalEvents = events.length;
    const upcomingEvents = events.filter(e => !isPast(parseISO(e.date))).length;
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const thisMonthEvents = events.filter(e => isThisMonth(parseISO(e.date))).length;
    const thisYearEvents = events.filter(e => isThisYear(parseISO(e.date))).length;

    const categoryStats = categories.map(cat => {
      const count = events.filter(e => e.category === cat.name).length;
      const percentage = totalEvents > 0 ? (count / totalEvents) * 100 : 0;
      return { ...cat, count, percentage };
    }).sort((a, b) => b.count - a.count);

    const mostPopularCategory = categoryStats[0];

    const monthlyTrend = {};
    events.forEach(event => {
      const month = format(parseISO(event.date), 'MMM yyyy');
      monthlyTrend[month] = (monthlyTrend[month] || 0) + 1;
    });

    const statusDistribution = {
      upcoming: events.filter(e => e.status === 'upcoming').length,
      ongoing: events.filter(e => e.status === 'ongoing').length,
      completed: events.filter(e => e.status === 'completed').length,
      cancelled: events.filter(e => e.status === 'cancelled').length,
    };

    return {
      totalEvents,
      upcomingEvents,
      completedEvents,
      thisMonthEvents,
      thisYearEvents,
      categoryStats,
      mostPopularCategory,
      monthlyTrend,
      statusDistribution
    };
  }, [events, categories]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="card" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      minHeight: '120px'
    }}>
      <div style={{
        backgroundColor: `${color}15`,
        color: color,
        padding: '1rem',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={28} />
      </div>
      <div>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--color-text-secondary)',
          marginBottom: '0.25rem'
        }}>
          {title}
        </p>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: 'var(--color-text)'
        }}>
          {value}
        </h2>
        {subtitle && (
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-tertiary)',
            marginTop: '0.25rem'
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Analytics
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Track your event performance and insights
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          icon={Calendar}
          title="Total Events"
          value={analytics.totalEvents}
          subtitle="All time"
          color="#2563eb"
        />
        <StatCard
          icon={TrendingUp}
          title="This Year"
          value={analytics.thisYearEvents}
          subtitle={`${analytics.thisMonthEvents} this month`}
          color="#10b981"
        />
        <StatCard
          icon={Users}
          title="Completed"
          value={analytics.completedEvents}
          subtitle={`${analytics.upcomingEvents} upcoming`}
          color="#f59e0b"
        />
        <StatCard
          icon={Award}
          title="Success Rate"
          value={`${analytics.totalEvents > 0 ? Math.round((analytics.completedEvents / analytics.totalEvents) * 100) : 0}%`}
          subtitle="Completion rate"
          color="#ec4899"
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card">
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1.5rem'
          }}>
            Category Distribution
          </h2>

          {analytics.categoryStats.length === 0 ? (
            <p style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--color-text-secondary)'
            }}>
              No data available
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analytics.categoryStats.map((category) => (
                <div key={category.id}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <span style={{ fontWeight: '500' }}>{category.name}</span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {category.count} events ({category.percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    borderRadius: '999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${category.percentage}%`,
                      backgroundColor: category.color,
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1.5rem'
          }}>
            Event Status
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(analytics.statusDistribution).map(([status, count]) => {
              const total = analytics.totalEvents;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const colors = {
                upcoming: '#2563eb',
                ongoing: '#10b981',
                completed: '#f59e0b',
                cancelled: '#ef4444'
              };

              return (
                <div key={status}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <span style={{
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {status}
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {count} events ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    borderRadius: '999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${percentage}%`,
                      backgroundColor: colors[status],
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          marginBottom: '1.5rem'
        }}>
          Key Insights
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <Award size={20} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                Most Popular Category
              </h3>
            </div>
            <p style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--color-text)',
              marginBottom: '0.25rem'
            }}>
              {analytics.mostPopularCategory?.name || 'N/A'}
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)'
            }}>
              {analytics.mostPopularCategory?.count || 0} events
            </p>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <TrendingUp size={20} style={{ color: 'var(--color-success)' }} />
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                Average per Month
              </h3>
            </div>
            <p style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--color-text)',
              marginBottom: '0.25rem'
            }}>
              {Object.keys(analytics.monthlyTrend).length > 0
                ? Math.round(analytics.totalEvents / Object.keys(analytics.monthlyTrend).length)
                : 0}
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)'
            }}>
              events per month
            </p>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <Calendar size={20} style={{ color: 'var(--color-accent)' }} />
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                Active Events
              </h3>
            </div>
            <p style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--color-text)',
              marginBottom: '0.25rem'
            }}>
              {analytics.upcomingEvents + analytics.statusDistribution.ongoing}
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)'
            }}>
              upcoming & ongoing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

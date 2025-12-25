import React from "react";

const AchievementCard = ({ achievements }) => {
    if (!achievements || achievements.length === 0) {
        return (
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">🏆 Achievements</h5>
                    <p className="text-muted">Complete your sustainability goals to earn achievements!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">🏆 Achievements ({achievements.length})</h5>
                <div className="row">
                    {achievements.map((achievement, index) => (
                        <div key={achievement._id || index} className="col-md-4 col-lg-3 mb-3">
                            <div className="card bg-success text-white h-100">
                                <div className="card-body text-center p-3">
                                    <div className="mb-2" style={{ fontSize: "2rem" }}>🎉</div>
                                    <h6 className="card-title mb-1">{achievement.title}</h6>
                                    <small>
                                        Completed: {achievement.targetValue} {achievement.unit}
                                    </small>
                                    <div className="mt-2">
                                        <small className="opacity-75">
                                            {new Date(achievement.updatedAt || achievement.createdAt).toLocaleDateString()}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AchievementCard;

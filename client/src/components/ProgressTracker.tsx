import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { Trophy, Clock, Target, TrendingUp, Award, Zap } from 'lucide-react'

interface ProgressTrackerProps {
  className?: string
}

export default function ProgressTracker({ className = '' }: ProgressTrackerProps) {
  const {
    readingProgress,
    milestones,
    getProgressPercentage,
    getTotalLines,
    currentLine,
    setReadingProgress,
  } = useStore()

  const [stats, setStats] = useState({
    totalReadingTime: 0,
    documentsCompleted: 0,
    averageSpeed: 0,
    comprehensionScore: 0,
    currentStreak: 0,
    achievements: 0,
  })

  // Update progress periodically
  useEffect(() => {
    const updateProgress = async () => {
      if (!readingProgress) return

      try {
        const response = await fetch('http://localhost:8000/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(readingProgress),
        })
        const data = await response.json()
        
        if (data.status === 'recorded') {
          // Add milestone to local state
          setReadingProgress({
            ...readingProgress,
            current_line: currentLine,
            time_spent: readingProgress.time_spent + 1,
          })
        }
      } catch (error) {
        console.error('Failed to update progress:', error)
      }
    }

    const interval = setInterval(updateProgress, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [readingProgress, currentLine, setReadingProgress])

  const progressPercentage = getProgressPercentage()
  const totalLines = getTotalLines()

  const achievements = [
    {
      id: 'first_read',
      name: 'First Steps',
      description: 'Completed your first reading session',
      icon: <Trophy size={20} />,
      unlocked: true,
    },
    {
      id: 'speed_reader',
      name: 'Speed Reader',
      description: 'Read at 200+ words per minute',
      icon: <Zap size={20} />,
      unlocked: stats.averageSpeed >= 200,
    },
    {
      id: 'focused_reader',
      name: 'Focused Reader',
      description: 'Completed 5 reading sessions',
      icon: <Target size={20} />,
      unlocked: stats.documentsCompleted >= 5,
    },
    {
      id: 'comprehension_master',
      name: 'Comprehension Master',
      description: 'Achieved 90%+ comprehension score',
      icon: <Award size={20} />,
      unlocked: stats.comprehensionScore >= 0.9,
    },
  ]

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <TrendingUp size={20} />
        Reading Progress
      </h3>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Overall Progress</span>
          <span className="text-sm font-medium text-gray-800">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="progress-bar h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Line {currentLine + 1} of {totalLines}
        </div>
      </div>

      {/* Reading Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Time Spent</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {Math.floor((readingProgress?.time_spent || 0) / 60)}m
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-800">Speed</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {stats.averageSpeed} WPM
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Comprehension</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {Math.round(stats.comprehensionScore * 100)}%
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Streak</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {stats.currentStreak} days
          </div>
        </div>
      </div>

      {/* Recent Milestones */}
      {milestones.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Milestones</h4>
          <div className="space-y-2">
            {milestones.slice(-3).map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="milestone-badge inline-block mr-2 mb-2"
              >
                {milestone}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Achievements</h4>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              className={`p-3 rounded-lg border-2 transition-all ${
                achievement.unlocked
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={achievement.unlocked ? 'text-green-600' : 'text-gray-400'}>
                  {achievement.icon}
                </div>
                <span className={`text-xs font-medium ${
                  achievement.unlocked ? 'text-green-800' : 'text-gray-500'
                }`}>
                  {achievement.name}
                </span>
              </div>
              <p className={`text-xs ${
                achievement.unlocked ? 'text-green-700' : 'text-gray-400'
              }`}>
                {achievement.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Blockchain Integration Notice */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-blue-800">Blockchain Connected</span>
        </div>
        <p className="text-xs text-blue-600">
          Your reading progress is being tracked on the Solana blockchain. 
          Earn rewards for consistent reading!
        </p>
      </div>
    </div>
  )
}

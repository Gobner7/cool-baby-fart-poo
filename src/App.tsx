import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Brain, Shield, Zap, BarChart2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { SolverStats } from './components/SolverStats';
import { SolverLogs } from './components/SolverLogs';
import { ComboListUploader } from './components/ComboListUploader';
import { AccountCreator } from './components/AccountCreator';

const queryClient = new QueryClient();

function SolverApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.header 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Roblox FunCaptcha Solver
          </h1>
          <p className="text-xl text-gray-400">Advanced Arkose Labs automation with neural processing</p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Neural Processing</h3>
                <p className="text-gray-400">Advanced pattern recognition</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Anti-Detection</h3>
                <p className="text-gray-400">Advanced fingerprint spoofing</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">High Performance</h3>
                <p className="text-gray-400">Optimized solving speed</p>
              </div>
            </div>
          </motion.div>
        </div>

        <Dashboard />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComboListUploader />
          <AccountCreator />
        </div>
        
        <SolverStats />
        <SolverLogs />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SolverApp />
    </QueryClientProvider>
  );
}
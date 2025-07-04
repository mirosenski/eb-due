import React from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/ui/Logo';

const LogoTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/10 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            🎨 Logo-Test-Seite
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Testen Sie verschiedene Größen und Varianten des animierten eb-due Logos
          </p>
        </motion.div>

        {/* Verschiedene Logo-Größen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Klein (sm)</h3>
            <div className="flex justify-center">
              <Logo size="sm" animated={true} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mittel (md)</h3>
            <div className="flex justify-center">
              <Logo size="md" animated={true} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Groß (lg)</h3>
            <div className="flex justify-center">
              <Logo size="lg" animated={true} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Extra Groß (xl)</h3>
            <div className="flex justify-center">
              <Logo size="xl" animated={true} />
            </div>
          </motion.div>
        </div>

        {/* Logo-Varianten */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Nur Logo (ohne Text)</h3>
            <div className="flex justify-center">
              <Logo size="lg" showText={false} animated={true} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
              Verwendet in: Login-Form, Loading-Screens
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Logo mit Text</h3>
            <div className="flex justify-center">
              <Logo size="lg" showText={true} animated={true} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
              Verwendet in: Header, Footer
            </p>
          </motion.div>
        </div>

        {/* Statische vs Animierte Varianten */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Statisch (ohne Animation)</h3>
            <div className="flex justify-center">
              <Logo size="lg" animated={false} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
              Für Performance-kritische Bereiche
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Animiert (mit Effekten)</h3>
            <div className="flex justify-center">
              <Logo size="lg" animated={true} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
              Mit Hover-Effekten und Animationen
            </p>
          </motion.div>
        </div>

        {/* Technische Informationen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8"
        >
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            🛠️ Technische Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Verfügbare Props:</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• <code>size</code>: "sm" | "md" | "lg" | "xl"</li>
                <li>• <code>showText</code>: boolean</li>
                <li>• <code>animated</code>: boolean</li>
                <li>• <code>className</code>: string</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Animationen:</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Rotierende Ringe</li>
                <li>• Pulsierende Sterne</li>
                <li>• Hover-Skalierung</li>
                <li>• Gradient-Text-Animation</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Navigation zurück */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center mt-8"
        >
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '';
            }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            ← Zurück zur Hauptanwendung
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default LogoTestPage; 
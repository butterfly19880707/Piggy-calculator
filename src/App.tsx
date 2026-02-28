/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete, RotateCcw, Equal, Plus, Minus, X, Divide, Percent, History, Trash2, X as CloseIcon } from 'lucide-react';

export default function App() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [history, setHistory] = useState<{ equation: string; result: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleNumber = (num: string) => {
    if (isFinished) {
      setDisplay(num);
      setIsFinished(false);
      return;
    }
    setDisplay(prev => (prev === '0' ? num : prev + num));
  };

  const evaluateExpression = (expr: string) => {
    const parts = expr.trim().split(' ');
    if (parts.length < 3) return parts[0];

    let result = parseFloat(parts[0]);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i];
      const nextVal = parseFloat(parts[i + 1]);
      if (isNaN(nextVal)) continue;

      switch (op) {
        case '+': result += nextVal; break;
        case '-': result -= nextVal; break;
        case '×': result *= nextVal; break;
        case '÷': result = nextVal !== 0 ? result / nextVal : 0; break;
      }
    }
    return Number(result.toFixed(8)).toString();
  };

  const handleOperator = (op: string) => {
    if (isFinished) {
      setEquation(display + ' ' + op + ' ');
      setIsFinished(false);
      setDisplay('0');
      return;
    }

    // If user presses operator multiple times, replace the last one
    if (display === '0' && equation !== '') {
      setEquation(prev => {
        const parts = prev.trim().split(' ');
        parts[parts.length - 1] = op;
        return parts.join(' ') + ' ';
      });
      return;
    }

    setEquation(prev => prev + display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    if (!equation) return;
    try {
      const fullEquation = equation + display;
      const result = evaluateExpression(fullEquation);
      
      // Add to history
      setHistory(prev => [{ equation: fullEquation, result }, ...prev].slice(0, 50));
      
      setDisplay(result);
      setEquation('');
      setIsFinished(true);
    } catch (e) {
      setDisplay('Error');
      setEquation('');
    }
  };

  const handlePercent = () => {
    const currentVal = parseFloat(display);
    if (isNaN(currentVal)) return;
    
    // If there's an equation, percentage usually means % of the first number
    // e.g., 200 + 10% = 220
    // But for simplicity in a basic calculator, it often just divides by 100
    // Let's implement the "divide by 100" behavior first as it's more standard for the % key alone
    const result = currentVal / 100;
    setDisplay(result.toString());
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setIsFinished(false);
  };

  const backspace = () => {
    if (isFinished) return;
    setDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const Button = ({ 
    children, 
    onClick, 
    className = '', 
    variant = 'default' 
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    className?: string;
    variant?: 'default' | 'operator' | 'action' | 'equal'
  }) => {
    const variants = {
      default: 'bg-pink-100 text-pink-600 hover:bg-pink-200',
      operator: 'bg-pink-400 text-white hover:bg-pink-500',
      action: 'bg-pink-200 text-pink-700 hover:bg-pink-300',
      equal: 'bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-200'
    };

    return (
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className={`h-16 w-full rounded-2xl font-bold text-xl flex items-center justify-center transition-colors ${variants[variant]} ${className}`}
      >
        {children}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4 font-sans select-none overflow-hidden touch-none relative">
      
      {/* History Toggle Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowHistory(true)}
        className="absolute top-6 right-6 p-3 bg-white rounded-full shadow-md text-pink-400 hover:text-pink-600 transition-colors z-20"
      >
        <History size={24} />
      </motion.button>

      {/* History Sidebar/Overlay */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-pink-900/20 backdrop-blur-sm z-30"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-xs bg-white shadow-2xl z-40 p-6 flex flex-col border-l-4 border-pink-200"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
                  <History size={24} />
                  History
                </h2>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-pink-50 rounded-full text-pink-400 transition-colors"
                >
                  <CloseIcon size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center py-10 text-pink-300 italic">
                    No calculations yet!
                  </div>
                ) : (
                  history.map((item, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={index}
                      className="bg-pink-50 p-4 rounded-2xl border-2 border-pink-100 group relative"
                    >
                      <div className="text-pink-300 text-sm font-mono mb-1 truncate">
                        {item.equation} =
                      </div>
                      <div className="text-pink-600 text-xl font-bold">
                        {item.result}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="mt-6 w-full py-3 bg-pink-100 text-pink-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-pink-200 transition-colors"
                >
                  <Trash2 size={18} />
                  Clear History
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Piggy Head Container */}
      <div className="relative w-full max-w-xs">
        
        {/* Ears */}
        <div className="absolute -top-6 left-8 w-12 h-12 bg-pink-300 rounded-full -rotate-12 border-4 border-pink-400"></div>
        <div className="absolute -top-6 right-8 w-12 h-12 bg-pink-300 rounded-full rotate-12 border-4 border-pink-400"></div>
        
        {/* Main Body (Calculator Face) */}
        <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-pink-300 overflow-hidden relative z-10">
          
          {/* Display Area */}
          <div className="bg-pink-50 p-6 pt-10 pb-4 text-right">
            <div className="text-pink-300 text-sm h-6 font-mono mb-1 overflow-hidden">
              {equation}
            </div>
            <div className="text-pink-600 text-4xl font-bold truncate">
              {display}
            </div>
          </div>

          {/* Snout (Functional Backspace Button) */}
          <div className="flex justify-center -mt-2 mb-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={backspace}
              title="Backspace"
              className="w-20 h-12 bg-pink-200 rounded-full border-4 border-pink-300 flex items-center justify-center gap-3 cursor-pointer shadow-sm hover:bg-pink-300 transition-colors"
            >
              <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
              <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
            </motion.button>
          </div>

          {/* Keypad */}
          <div className="p-4 grid grid-cols-4 gap-3">
            <Button variant="action" onClick={handlePercent}><Percent size={24} /></Button>
            <Button variant="action" onClick={clear}><RotateCcw size={24} /></Button>
            <Button variant="operator" onClick={() => handleOperator('÷')}><Divide size={24} /></Button>
            <Button variant="operator" onClick={() => handleOperator('×')}><X size={24} /></Button>

            <Button onClick={() => handleNumber('7')}>7</Button>
            <Button onClick={() => handleNumber('8')}>8</Button>
            <Button onClick={() => handleNumber('9')}>9</Button>
            <Button variant="operator" onClick={() => handleOperator('-')}><Minus size={24} /></Button>

            <Button onClick={() => handleNumber('4')}>4</Button>
            <Button onClick={() => handleNumber('5')}>5</Button>
            <Button onClick={() => handleNumber('6')}>6</Button>
            <Button variant="operator" onClick={() => handleOperator('+')}><Plus size={24} /></Button>

            <Button onClick={() => handleNumber('1')}>1</Button>
            <Button onClick={() => handleNumber('2')}>2</Button>
            <Button onClick={() => handleNumber('3')}>3</Button>
            <Button variant="equal" onClick={calculate} className="row-span-2 h-full"><Equal size={28} /></Button>

            <Button onClick={() => handleNumber('0')} className="col-span-2">0</Button>
            <Button onClick={() => handleNumber('.')}>.</Button>
          </div>
        </div>

        {/* Feet */}
        <div className="flex justify-around px-10 -mt-4 relative z-0">
          <div className="w-10 h-8 bg-pink-300 rounded-b-2xl border-x-4 border-b-4 border-pink-400"></div>
          <div className="w-10 h-8 bg-pink-300 rounded-b-2xl border-x-4 border-b-4 border-pink-400"></div>
        </div>

        {/* Tail (Small detail) */}
        <div className="absolute -right-4 top-1/2 w-8 h-8 border-4 border-pink-300 rounded-full border-t-transparent border-l-transparent rotate-45"></div>
      </div>

      <p className="mt-8 text-pink-400 font-medium italic">Oink oink! Happy calculating!</p>
    </div>
  );
}

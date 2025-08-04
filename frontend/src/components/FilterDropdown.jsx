// import { useEffect, useRef, useState } from "react";

// const FilterDropdown = ({
//   selectedCategories,
//   setSelectedCategories,
//   selectedDifficulty,
//   setSelectedDifficulty,
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef();

//   // ✅ Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const categories = ["web", "mobile", "desktop", "ai", "iot", "other"];
//   const difficulties = ["beginner", "intermediate", "advanced"];

//   const toggleCategory = (category) => {
//     setSelectedCategories((prev) =>
//       prev.includes(category)
//         ? prev.filter((c) => c !== category)
//         : [...prev, category]
//     );
//   };

//   return (
//     <div className="relative inline-block text-left" ref={dropdownRef}>
//       {/* Dropdown Button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
//       >
//         Filter
//         <svg
//           className="w-4 h-4 ml-2"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={2}
//           viewBox="0 0 24 24"
//         >
//           <path d="M19 9l-7 7-7-7" />
//         </svg>
//       </button>

//       {/* Dropdown Content */}
//       {isOpen && (
//         <div className="absolute z-50 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4">
//           {/* Difficulty Filter */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty</label>
//             <div className="space-y-1">
//               {difficulties.map((level) => (
//                 <label key={level} className="flex items-center gap-2 text-sm capitalize">
//                   <input
//                     type="radio"
//                     name="difficulty"
//                     value={level}
//                     checked={selectedDifficulty === level}
//                     onChange={() => setSelectedDifficulty(level)}
//                     className="accent-indigo-600"
//                   />
//                   {level}
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* Category Filter */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
//             <div className="flex flex-wrap gap-3 max-h-24 overflow-y-auto">
//               {categories.map((category) => (
//                 <label key={category} className="flex items-center gap-2 text-sm capitalize">
//                   <input
//                     type="checkbox"
//                     value={category}
//                     checked={selectedCategories.includes(category)}
//                     onChange={() => toggleCategory(category)}
//                     className="accent-indigo-600"
//                   />
//                   {category}
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* Clear Buttons */}
//           {(selectedCategories.length > 0 || selectedDifficulty) && (
//             <div className="flex justify-between pt-2 border-t text-sm">
//               {selectedDifficulty && (
//                 <button
//                   onClick={() => setSelectedDifficulty("")}
//                   className="text-indigo-600 hover:underline"
//                 >
//                   Clear Difficulty
//                 </button>
//               )}
//               {selectedCategories.length > 0 && (
//                 <button
//                   onClick={() => setSelectedCategories([])}
//                   className="text-indigo-600 hover:underline"
//                 >
//                   Clear Categories
//                 </button>
//               )}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default FilterDropdown;










// //all good

// import { useEffect, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { FiFilter, FiX, FiCheck } from "react-icons/fi";

// const FilterDropdown = ({
//   selectedCategories,
//   setSelectedCategories,
//   selectedDifficulty,
//   setSelectedDifficulty,
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef();

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const categories = ["web", "mobile", "desktop", "ai", "iot", "other"];
//   const difficulties = ["beginner", "intermediate", "advanced"];

//   const toggleCategory = (category) => {
//     setSelectedCategories((prev) =>
//       prev.includes(category)
//         ? prev.filter((c) => c !== category)
//         : [...prev, category]
//     );
//   };

//   return (
//     <div className="relative inline-block text-left" ref={dropdownRef}>
//       <motion.button
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95 }}
//         onClick={() => setIsOpen(!isOpen)}
//         className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg shadow-sm transition-all"
//       >
//         <FiFilter className="mr-2" />
//         Filter
//         {(selectedCategories.length > 0 || selectedDifficulty) && (
//           <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white text-indigo-600 text-xs font-bold">
//             {selectedCategories.length + (selectedDifficulty ? 1 : 0)}
//           </span>
//         )}
//       </motion.button>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: 20, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 20, scale: 0.95 }}
//             transition={{ type: "spring", damping: 20, stiffness: 300 }}
//             className="absolute z-50 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-4 space-y-4"
//           >
//             {/* Difficulty Filter */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
//               <div className="grid grid-cols-3 gap-2">
//                 {difficulties.map((level) => (
//                   <motion.button
//                     key={level}
//                     whileHover={{ scale: 1.03 }}
//                     whileTap={{ scale: 0.97 }}
//                     onClick={() => setSelectedDifficulty(level === selectedDifficulty ? "" : level)}
//                     className={`flex items-center justify-center gap-2 text-sm capitalize px-3 py-2 rounded-lg ${
//                       selectedDifficulty === level
//                         ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
//                         : "bg-gray-100 hover:bg-gray-200 text-gray-700"
//                     }`}
//                   >
//                     {selectedDifficulty === level && <FiCheck className="h-4 w-4" />}
//                     {level}
//                   </motion.button>
//                 ))}
//               </div>
//             </div>

//             {/* Category Filter */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
//               <div className="grid grid-cols-2 gap-2">
//                 {categories.map((category) => (
//                   <motion.button
//                     key={category}
//                     whileHover={{ scale: 1.03 }}
//                     whileTap={{ scale: 0.97 }}
//                     onClick={() => toggleCategory(category)}
//                     className={`flex items-center justify-between text-sm capitalize px-3 py-2 rounded-lg ${
//                       selectedCategories.includes(category)
//                         ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
//                         : "bg-gray-100 hover:bg-gray-200 text-gray-700"
//                     }`}
//                   >
//                     {category}
//                     {selectedCategories.includes(category) && (
//                       <FiCheck className="h-4 w-4" />
//                     )}
//                   </motion.button>
//                 ))}
//               </div>
//             </div>

//             {/* Clear Buttons */}
//             {(selectedCategories.length > 0 || selectedDifficulty) && (
//               <motion.div 
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="flex justify-between pt-4 border-t border-gray-100 text-sm"
//               >
//                 {selectedDifficulty && (
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => setSelectedDifficulty("")}
//                     className="flex items-center text-indigo-600 hover:text-indigo-800"
//                   >
//                     <FiX className="mr-1" />
//                     Clear Difficulty
//                   </motion.button>
//                 )}
//                 {selectedCategories.length > 0 && (
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => setSelectedCategories([])}
//                     className="flex items-center text-indigo-600 hover:text-indigo-800"
//                   >
//                     <FiX className="mr-1" />
//                     Clear Categories
//                   </motion.button>
//                 )}
//               </motion.div>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default FilterDropdown;









import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilter, FiX, FiCheck } from "react-icons/fi";

const FilterDropdown = ({
  selectedCategories,
  setSelectedCategories,
  selectedDifficulty,
  setSelectedDifficulty,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const categories = ["web", "mobile", "desktop", "ai", "iot", "other"];
  const difficulties = ["beginner", "intermediate", "advanced"];

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex justify-center items-center px-3 sm:px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg shadow-sm transition-all"
      >
        <FiFilter className="mr-2" />
        Filter
        {(selectedCategories.length > 0 || selectedDifficulty) && (
          <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white text-indigo-600 text-xs font-bold">
            {selectedCategories.length + (selectedDifficulty ? 1 : 0)}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed sm:absolute z-50 right-4 left-4 sm:left-auto sm:right-0 mt-2 w-auto sm:w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-4 space-y-4"
            style={{ maxWidth: 'calc(100vw - 2rem)' }}
          >
            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {difficulties.map((level) => (
                  <motion.button
                    key={level}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedDifficulty(level === selectedDifficulty ? "" : level)}
                    className={`flex items-center justify-center gap-2 text-xs sm:text-sm capitalize px-2 sm:px-3 py-2 rounded-lg ${
                      selectedDifficulty === level
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {selectedDifficulty === level && <FiCheck className="h-3 w-3 sm:h-4 sm:w-4" />}
                    {level}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleCategory(category)}
                    className={`flex items-center justify-between text-xs sm:text-sm capitalize px-2 sm:px-3 py-2 rounded-lg ${
                      selectedCategories.includes(category)
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <span className="truncate">{category}</span>
                    {selectedCategories.includes(category) && (
                      <FiCheck className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Clear Buttons */}
            {(selectedCategories.length > 0 || selectedDifficulty) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:justify-between pt-4 border-t border-gray-100 text-xs sm:text-sm space-y-2 sm:space-y-0"
              >
                {selectedDifficulty && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDifficulty("")}
                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                  >
                    <FiX className="mr-1" />
                    Clear Difficulty
                  </motion.button>
                )}
                {selectedCategories.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategories([])}
                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                  >
                    <FiX className="mr-1" />
                    Clear Categories
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterDropdown;
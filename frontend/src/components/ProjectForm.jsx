// import { useNavigate, useParams } from 'react-router-dom';

// export default function ProjectForm({
//   formData,
//   setFormData,
//   loading,
//   onSubmit,
//   isEditing = false,
// }) {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const categories = ['web', 'mobile', 'desktop', 'ai', 'iot', 'other'];
//   const difficulties = ['beginner', 'intermediate', 'advanced'];
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleTagAdd = () => {
//     if (formData.currentTag && !formData.tags.includes(formData.currentTag)) {
//       setFormData((prev) => ({
//         ...prev,
//         tags: [...prev.tags, prev.currentTag],
//         currentTag: '',
//       }));
//     }
//   };

//   const handleTagRemove = (tagToRemove) => {
//     setFormData((prev) => ({
//       ...prev,
//       tags: prev.tags.filter((tag) => tag !== tagToRemove),
//     }));
//   };

//   return (
//     <div className="max-w-2xl mx-auto py-8 px-4">
//       <h1 className="text-3xl font-bold text-blue-500 mb-6">
//         {isEditing ? 'Edit Project' : 'Create New Project'}
//       </h1>
//       <form onSubmit={onSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="title" className="block text-sm font-medium text-gray-700">
//             Title*
//           </label>
//           <input
//             type="text"
//             id="title"
//             name="title"
//             value={formData.title}
//             onChange={handleChange}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
//             required
//             maxLength={100}
//           />
//           <p className="text-xs text-gray-500 mt-1">Max 100 characters</p>
//         </div>

//         <div>
//           <label htmlFor="description" className="block text-sm font-medium text-gray-700">
//             Description*
//           </label>
//           <textarea
//             id="description"
//             name="description"
//             rows={6}
//             value={formData.description}
//             onChange={handleChange}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
//             required
//           />
//         </div>

//         <div>
//           <label htmlFor="currentTag" className="block text-sm font-medium text-gray-700">
//             Tags*
//           </label>
//           <div className="flex mt-1">
//             <input
//               type="text"
//               id="currentTag"
//               value={formData.currentTag}
//               onChange={(e) => setFormData((prev) => ({ ...prev, currentTag: e.target.value }))}
//               className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
//               placeholder="Add a tag"
//             />
//             <button
//               type="button"
//               onClick={handleTagAdd}
//               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
//             >
//               Add
//             </button>
//           </div>
//           <div className="flex flex-wrap gap-2 mt-2">
//             {formData.tags.map((tag) => (
//               <span
//                 key={tag}
//                 className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
//               >
//                 {tag}
//                 <button
//                   type="button"
//                   onClick={() => handleTagRemove(tag)}
//                   className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
//                 >
//                   ×
//                 </button>
//               </span>
//             ))}
//           </div>
//           <p className="text-xs text-gray-500 mt-1">Add at least one tag</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label htmlFor="category" className="block text-sm font-medium text-gray-700">
//               Category*
//             </label>
//             <select
//               id="category"
//               name="category"
//               value={formData.category}
//               onChange={handleChange}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
//               required
//             >
//               {categories.map((cat) => (
//                 <option key={cat} value={cat}>
//                   {cat.charAt(0).toUpperCase() + cat.slice(1)}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
//               Difficulty
//             </label>
//             <select
//               id="difficulty"
//               name="difficulty"
//               value={formData.difficulty}
//               onChange={handleChange}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
//             >
//               {difficulties.map((diff) => (
//                 <option key={diff} value={diff}>
//                   {diff.charAt(0).toUpperCase() + diff.slice(1)}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div>
//           <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700">
//             GitHub URL
//           </label>
//           <input
//             type="url"
//             id="githubUrl"
//             name="githubUrl"
//             value={formData.githubUrl}
//             onChange={handleChange}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
//             placeholder="https://github.com/yourusername/yourproject"
//           />
//         </div>

//         <div>
//           <label htmlFor="documentationUrl" className="block text-sm font-medium text-gray-700">
//             Documentation URL
//           </label>
//           <input
//             type="url"
//             id="documentationUrl"
//             name="documentationUrl"
//             value={formData.documentationUrl}
//             onChange={handleChange}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
//             placeholder="https://your-docs-site.com"
//           />
//         </div>

//         <div className="flex space-x-4">
//           <button
//             type="submit"
//             disabled={loading || formData.tags.length === 0}
//             className="bg-primary text-blue-700 py-2 px-4 rounded-md hover:bg-primary-dark disabled:opacity-50"
//           >
//             {loading ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Project' : 'Create Project'}
//           </button>
//           {isEditing && (
//             <button
//               type="button"
//               onClick={() => navigate(`/projects/${id}`)}
//               className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
//             >
//               Cancel
//             </button>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// }


import { useNavigate, useParams } from 'react-router-dom';

export default function ProjectForm({
  formData,
  setFormData,
  loading,
  onSubmit,
  isEditing = false,
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const categories = ['web', 'mobile', 'desktop', 'ai', 'iot', 'other'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagAdd = () => {
    if (formData.currentTag && !formData.tags.includes(formData.currentTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.currentTag],
        currentTag: '',
      }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </h1>
          <p className="text-indigo-100 mt-1">
            {isEditing ? 'Update your project details' : 'Share your amazing project with the community'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
              maxLength={100}
              placeholder="My Awesome Project"
            />
            <p className="text-xs text-gray-500 mt-1">Max 100 characters</p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
              placeholder="Describe your project in detail..."
            />
          </div>

          <div>
            <label htmlFor="currentTag" className="block text-sm font-medium text-gray-700 mb-1">
              Tags*
            </label>
            <div className="flex">
              <input
                type="text"
                id="currentTag"
                value={formData.currentTag}
                onChange={(e) => setFormData((prev) => ({ ...prev, currentTag: e.target.value }))}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Add a tag (e.g., React, Node.js)"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="px-4 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-2 text-indigo-400 hover:text-indigo-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Add at least one tag</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-1">
              GitHub URL
            </label>
            <input
              type="url"
              id="githubUrl"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="https://github.com/yourusername/yourproject"
            />
          </div>

          <div>
            <label htmlFor="documentationUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Documentation URL
            </label>
            <input
              type="url"
              id="documentationUrl"
              name="documentationUrl"
              value={formData.documentationUrl}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="https://your-docs-site.com"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading || formData.tags.length === 0}
              className={`flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg ${(loading || formData.tags.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </span>
              ) : isEditing ? 'Update Project' : 'Create Project'}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={() => navigate(`/projects/${id}`)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
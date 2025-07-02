// src/component/ViewAll.tsx
import { SetStateAction, useEffect, useState } from 'react';
import axios from 'axios';
import DocModal from './DocDetailModal';

// interface DocEntry {
//   id: string;
// }

const ViewAll: React.FC = () => {
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const [docs, setDocs] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [docContent, setDocContent] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Page division
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // GET all doc IDs fore present
  useEffect(() => {
    axios
      .get(`${backendURL}/docs/ids`)
      .then((res: { data: { ids: SetStateAction<string[]>; }; }) => setDocs(res.data.ids))
      .catch((err: object) => console.error('Failed to fetch docs:', err));
  }, [backendURL]);

  // Get Doc info for displaying
  useEffect(() => {
    if (selectedDoc) {
      axios
        .get(`${backendURL}/doc/${encodeURIComponent(selectedDoc)}`)
        .then((res) => setDocContent(res.data.content))
        .catch((error) => setDocContent(`[!] Error loading content: ${error}`));
    }
  }, [selectedDoc, backendURL]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Delete the Doc on doc ID
  const handleDelete = (docId: string) => {
    console.log(`Deleting ${docId}`);
    const encodedId = encodeURIComponent(docId); // Encode first for any special chars
    axios
      .delete(`${backendURL}/doc/${encodedId}`)
      .then(() => {
        setDocs((prev) => prev.filter((id) => id !== docId));
        setShowDeleteConfirm(null);
        if (selectedDoc === docId) setSelectedDoc(null);
      })
      .catch((err: object) => console.error('Delete failed:', err));
  };

  const filteredDocs = docs.filter((id) => id.toLowerCase().includes(filter.toLowerCase()));
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const currentItems = filteredDocs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search by Doc ID..."
        className="w-full p-2 border rounded focus:outline-none focus:ring"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      {/* Doc List */}
      <div className="space-y-2 min-h-[70vh]">
        {currentItems.map((id, index) => (
          <div
            key={id}
            className="flex justify-between items-center bg-white p-3 rounded shadow hover:bg-gray-100"
            onClick={() => setSelectedDoc(id)}
          >
            <div className="flex items-center gap-4">
              <span className="text-gray-500 w-6 text-right">{index + 1}.</span>
              <span
                className="text-blue-600 cursor-pointer hover:underline"
              >
                {id}
              </span>
            </div>
            <i
              className="bi bi-trash text-gray-400 hover:text-red-600 text-xl cursor-pointer"
              onClick={() => setShowDeleteConfirm(id)}
              onMouseEnter={(e) => (e.currentTarget.className = 'bi bi-trash-fill text-red-600 text-xl cursor-pointer')}
              onMouseLeave={(e) => (e.currentTarget.className = 'bi bi-trash text-gray-400 text-xl cursor-pointer')}
            ></i>
          </div>
        ))}
      </div>

      {/* Pager */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="!px-3 !py-1 !bg-gray-300 rounded disabled:opacity-40"
          >
            <i className="bi bi-arrow-left-short text-2xl"></i>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${page === currentPage
                  ? '!bg-blue-600 !text-white !font-bold'
                  : '!bg-gray-300 !text-gray-800'
                }`}
            >
              {page}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="!px-3 !py-1 !bg-gray-300 rounded disabled:opacity-40"
          >
            <i className="bi bi-arrow-right-short text-2xl"></i>
          </button>
        </div>
      )}


      {/* Doc info window */}
      {selectedDoc && (
        <DocModal
          docId={selectedDoc}
          initialContent={docContent || ''}
          onClose={() => setSelectedDoc(null)}
          onDelete={(id) => {
            setShowDeleteConfirm(id);
            setSelectedDoc(null);
          }}
        />
      )}

      {/* Comfirm Delete? */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6 text-center shadow-xl">
            <p className="text-lg font-semibold mb-2">Are you sure to delete this document?</p>
            <p className="text-sm text-gray-700 mb-6">{showDeleteConfirm}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="!bg-red-600 text-white px-4 py-2 rounded !hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="!bg-gray-500 text-white px-4 py-2 rounded !hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAll;

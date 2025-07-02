import { useState } from 'react';
import axios from 'axios';

interface RecordItem {
  id: string;
  content: string;
}

const BatchAdd: React.FC = () => {
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [segmentText, setSegmentText] = useState('');
  const [loadingSegment, setLoadingSegment] = useState(false);
  const [addInProgress, setAddInProgress] = useState(false);

  const handleAddEmptyRecord = () => {
    setRecords([...records, { id: '', content: '' }]);
  };

  const handleUpdateRecord = (index: number, key: 'id' | 'content', value: string) => {
    const updated = [...records];
    updated[index][key] = value;
    setRecords(updated);
  };

  const handleDeleteRecord = (index: number) => {
    const updated = [...records];
    updated.splice(index, 1);
    setRecords(updated);
  };

  const handleSubmitRecords = async () => {
    setAddInProgress(true);
    for (const record of records) {
      if (record.id && record.content) {
        await axios.post(`${backendURL}/doc/upsert`, record);
      }
    }
    setRecords([]);
    setAddInProgress(false);
  };

  const handleSegmentSubmit = async () => {
    setLoadingSegment(true);
    try {
      const res = await axios.post(`${backendURL}/chat/paragraph-divide`, {
        text: segmentText,
      });
      const segments: RecordItem[] = res.data.result;
      setRecords((prev) => [...prev, ...segments]);
      setShowSegmentModal(false);
      setSegmentText('');
    } catch (err) {
      console.error('Segmentation failed', err);
    } finally {
      setLoadingSegment(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowSegmentModal(true)}
          className="!bg-yellow-400 !text-yellow-900 px-4 py-2 rounded !hover:bg-yellow-300 text-sm font-semibold"
        >
          Auto Segmentation [beta]
        </button>

        <button
          onClick={handleSubmitRecords}
          disabled={records.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded text-white text-sm font-semibold transition ${records.length === 0
              ? '!bg-gray-400 cursor-not-allowed'
              : '!bg-blue-600 !hover:bg-blue-700'
            }`}
        >
          <i
            className={
              records.length === 0
                ? 'bi bi-database-slash'
                : 'bi bi-database-add hover:bi-database-fill-add'
            }
          ></i>
          {addInProgress ? "Adding..." : "Add All"}
        </button>
      </div>

      {records.map((record, index) => (
        <div key={index} className="space-y-2 border p-3 !rounded !bg-white !shadow-md shadow-sky-400/40">
          <div className="flex justify-between items-center">
            <label className="!font-bold">New Document</label>
            <button onClick={() => handleDeleteRecord(index)} className="!text-red-500 hover:underline !text-sm">
              Delete
            </button>
          </div>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Enter Document ID"
            value={record.id}
            onChange={(e) => handleUpdateRecord(index, 'id', e.target.value)}
          />
          <textarea
            rows={4}
            className="w-full p-2 border rounded resize-none"
            placeholder="Enter Content"
            value={record.content}
            onChange={(e) => handleUpdateRecord(index, 'content', e.target.value)}
          ></textarea>
        </div>
      ))}

      <div className="w-full border-dashed border-2 !border-gray-300 py-6 flex justify-center items-center rounded cursor-pointer hover:!bg-gray-50" 
      onClick={handleAddEmptyRecord}>
        <i className="bi bi-file-earmark-plus text-2xl !text-gray-500"></i>
      </div>

      {showSegmentModal && (
        <div className="fixed inset-0 !bg-black/50 flex items-center justify-center z-50">
          <div className="!bg-white w-full max-w-lg p-6 rounded-xl shadow-xl">
            <p className="text-lg font-bold mb-4">Auto Segmentation of a Long Paragraph</p>
            <p className='!text-gray-500'>[Beta Test Function]</p>
            <textarea
              rows={6}
              className="w-full p-3 border rounded resize-none mb-4"
              placeholder="Paste a long paragraph here..."
              value={segmentText}
              onChange={(e) => setSegmentText(e.target.value)}
            />
            {loadingSegment ? (
              <p className="text-center !text-blue-600 font-semibold">Loading Segmentation...</p>
            ) : (
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSegmentModal(false)}
                  className="!bg-gray-500 !text-white px-4 py-2 rounded !hover:bg-gray-600"
                >
                  Close
                </button>
                <button
                  onClick={handleSegmentSubmit}
                  className="!bg-blue-600 !text-white px-4 py-2 rounded !hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchAdd;

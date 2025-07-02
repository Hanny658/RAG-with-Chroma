import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DocModalProps {
    /**
     * Unique identifier for the document
     */
    docId: string;
    /**
     * Initial text content fetched for the document
     */
    initialContent: string;
    /**
     * Close handler, e.g. hides the modal
     */
    onClose: () => void;
    /**
     * Delete handler, called with the id when user clicks Delete
     */
    onDelete: (docId: string) => void;
}

const DocModal: React.FC<DocModalProps> = ({
    docId,
    initialContent,
    onClose,
    onDelete,
}) => {
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    // Track whether user is in editing mode
    const [isEditing, setIsEditing] = useState(false);
    // Current content in the text area/div
    const [content, setContent] = useState(initialContent);
    // Snapshot of original content, to detect changes
    const [originalContent, setOriginalContent] = useState(initialContent);
    // Submission loading state
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Whenever a new document is selected, reset states
        setContent(initialContent);
        setOriginalContent(initialContent);
        setIsEditing(false);
    }, [initialContent, docId]);

    /**
     * Submit updated content via POST to your backend
     */
    const handleSubmit = async () => {
        // Prevent accidental submits when nothing changed
        if (content === originalContent) return;
        setIsSubmitting(true);
        try {
            const record = { id: docId, content };
            await axios.post(`${backendURL}/doc/upsert`, record);
            // Update snapshot, exit edit mode
            setOriginalContent(content);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update document:', error);
            window.alert("Failed to update document. Please chaeck console for err.")
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white max-w-xl w-full rounded-xl shadow-xl p-6">
                {/* Title shows the document id */}
                <h2 className="text-xl font-bold mb-4">{docId}</h2>

                {/* Content area: click to edit, or textarea when editing */}
                <div className="max-h-[300px] overflow-y-auto border p-3 rounded text-sm whitespace-pre-wrap">
                    {!isEditing ? (
                        <div
                            onClick={() => setIsEditing(true)}
                            className="cursor-text"
                        >
                            {content || 'Loading content...'}
                        </div>
                    ) : (
                        <textarea
                            className="w-full h-[300px] p-2 border rounded text-sm"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex justify-between items-center gap-3 mt-6">
                    {/* Delete always visible */}
                    <button
                        onClick={() => onDelete(docId)}
                        className="!bg-red-600 text-white px-4 py-2 rounded hover:!bg-red-700"
                    >
                        Delete
                    </button>

                    <div className="flex items-center gap-2">
                        {/* Submit appears only in edit mode */}
                        {isEditing && (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || content === originalContent}
                                className={`px-4 py-2 rounded ${content === originalContent
                                        ? '!bg-gray-300 cursor-not-allowed'
                                        : '!bg-green-600 hover:!bg-green-700 text-white'
                                    }`}
                            >
                                {isSubmitting ? 'Saving...' : 'Submit'}
                            </button>
                        )}

                        {/* Close or Cancel depending on mode */}
                        <button
                            onClick={() => (isEditing ? setIsEditing(false) : onClose())}
                            className="!bg-blue-600 text-white px-4 py-2 rounded hover:!bg-blue-700"
                        >
                            {isEditing ? 'Cancel' : 'Close'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocModal;

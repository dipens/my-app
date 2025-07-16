'use client';

import { useState, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your post content...',
}: RichTextEditorProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showYouTubeDialog, setShowYouTubeDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);

    onChange(newValue);

    // Restore cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  const handleImageInsert = () => {
    if (imageUrl.trim()) {
      insertAtCursor(`![Image](${imageUrl.trim()})`);
      setImageUrl('');
      setShowImageDialog(false);
    }
  };

  const handleLinkInsert = () => {
    if (linkUrl.trim() && linkText.trim()) {
      insertAtCursor(`[${linkText.trim()}](${linkUrl.trim()})`);
      setLinkUrl('');
      setLinkText('');
      setShowLinkDialog(false);
    }
  };

  const extractYouTubeId = (url: string) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleYouTubeInsert = () => {
    if (youtubeUrl.trim()) {
      const videoId = extractYouTubeId(youtubeUrl.trim());
      if (videoId) {
        insertAtCursor(
          `[YouTube Video](https://www.youtube.com/watch?v=${videoId})`
        );
      } else {
        insertAtCursor(`[YouTube Video](${youtubeUrl.trim()})`);
      }
      setYoutubeUrl('');
      setShowYouTubeDialog(false);
    }
  };

  const formatSelection = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText || 'code'}\``;
        break;
      case 'quote':
        formattedText = `> ${selectedText || 'quoted text'}`;
        break;
      case 'list':
        formattedText = `- ${selectedText || 'list item'}`;
        break;
      case 'heading':
        formattedText = `## ${selectedText || 'heading'}`;
        break;
    }

    insertAtCursor(formattedText);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center space-x-2 flex-wrap">
        <button
          type="button"
          onClick={() => formatSelection('bold')}
          className="p-2 hover:bg-gray-200 rounded text-sm font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => formatSelection('italic')}
          className="p-2 hover:bg-gray-200 rounded text-sm italic"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => formatSelection('code')}
          className="p-2 hover:bg-gray-200 rounded text-sm font-mono"
          title="Code"
        >
          {'</>'}
        </button>
        <button
          type="button"
          onClick={() => formatSelection('quote')}
          className="p-2 hover:bg-gray-200 rounded text-sm"
          title="Quote"
        >
          {'"'}
        </button>
        <button
          type="button"
          onClick={() => formatSelection('list')}
          className="p-2 hover:bg-gray-200 rounded text-sm"
          title="List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => formatSelection('heading')}
          className="p-2 hover:bg-gray-200 rounded text-sm font-bold"
          title="Heading"
        >
          H
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        <button
          type="button"
          onClick={() => setShowImageDialog(true)}
          className="p-2 hover:bg-gray-200 rounded text-sm"
          title="Insert Image"
        >
          🖼️
        </button>
        <button
          type="button"
          onClick={() => setShowLinkDialog(true)}
          className="p-2 hover:bg-gray-200 rounded text-sm"
          title="Insert Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => setShowYouTubeDialog(true)}
          className="p-2 hover:bg-gray-200 rounded text-sm"
          title="Insert YouTube Video"
        >
          📺
        </button>
      </div>

      {/* Text Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-64 p-4 resize-none focus:outline-none"
        style={{ minHeight: '200px' }}
      />

      {/* Preview hint */}
      <div className="bg-gray-50 border-t border-gray-300 p-2 text-xs text-gray-600">
        Supports markdown formatting: **bold**, *italic*, `code`, {'>'}quotes, -
        lists, ## headings, links, and images
      </div>

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Image</h3>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="Enter image URL..."
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowImageDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImageInsert}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <input
              type="text"
              value={linkText}
              onChange={e => setLinkText(e.target.value)}
              placeholder="Link text..."
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
              autoFocus
            />
            <input
              type="url"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              placeholder="Enter URL..."
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLinkInsert}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Dialog */}
      {showYouTubeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert YouTube Video</h3>
            <input
              type="url"
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="Enter YouTube URL..."
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowYouTubeDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleYouTubeInsert}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

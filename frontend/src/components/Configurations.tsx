import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const Configurations: React.FC = () => {
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [currN, setCurrN] = useState(3);
  const [sliderValue, setSliderValue] = useState(3);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const [question, setQuestion] = useState('');
  const [loadingContext, setLoadingContext] = useState(false);
  const [contextData, setContextData] = useState('');

  // Initialisation of N value fron backend
  useEffect(() => {
    axios
      .post(`${backendURL}/update-n`, { n: 0 })
      .then((res) => {
        const serverN = res.data.n;
        setCurrN(serverN);
        setSliderValue(serverN);
      })
      .catch((err) => console.error('Failed to load N-RES value:', err));
  }, [backendURL]);

  // Save N value settings
  const handleSave = async () => {
    try {
      const res = await axios.post(`${backendURL}/update-n`, { n: sliderValue });
      const returnedN = res.data.n;
      if (returnedN === sliderValue) {
        setCurrN(sliderValue);
      } else {
        setCurrN(returnedN);
        setSliderValue(returnedN);
        window.alert('Oops, failed to update backend settings, please check if backend is running OK...');
      }
    } catch (err) {
      console.error('Error updating n value:', err);
      window.alert('Failed to process, please try again later.');
    }
  };

  // Logout with cleaning out Cookies
  const handleLogout = () => {
    Object.keys(Cookies.get()).forEach((cookie) => Cookies.remove(cookie));
    navigate('/');
  };


  const handleSubmitQuestion = async () => {
    if (!question) return;
    setLoadingContext(true);
    setContextData('');
    try {
      const res = await axios.post(`${backendURL}/test/get-context`, { question });
      setContextData(res.data.context || '');
    } catch (err) {
      console.error('Error getting context:', err);
      setContextData('Error fetching context data.');
    } finally {
      setLoadingContext(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Settings Area */}
      <div className="flex-1 space-y-6">
      <h2 className="text-lg font-bold !text-gray-800 text-center">
          Global Settings
        </h2>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2 relative">
            <span className="font-medium !text-gray-800">N-RES</span>
            <i
              className="bi bi-info-circle !text-gray-500 cursor-pointer"
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
            ></i>
            {tooltipVisible && (
              <div className="absolute top-8 left-0 z-10 w-64 p-2 !bg-white border border-gray-300 rounded shadow text-sm !text-gray-700">
                N-RES is used to control how many record should backend retrive from database to construct the context sending to LLM.
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-1/2">
            <input
              type="range"
              min="1"
              max="5"
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="w-full"
            />
            <span className="w-6 text-center">{sliderValue}</span>
          </div>

          <button
            onClick={handleSave}
            disabled={sliderValue === currN}
            className={`px-4 py-2 rounded text-sm font-semibold transition ${
              sliderValue === currN
                ? '!bg-gray-300 !text-gray-600 cursor-not-allowed'
                : '!bg-blue-600 text-white hover:!bg-blue-700'
            }`}
          >
            Save
          </button>
        </div>

        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full !bg-red-400 !text-white py-2 rounded hover:!bg-red-600 font-semibold"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Area for Playground */}
      <div className="flex-1 flex flex-col items-center justify-start space-y-4">
        <h2 className="text-lg font-bold !text-gray-800 text-center">
          Context Playground <span className="text-sm !text-gray-500">[token applies]</span>
        </h2>

        <input
          type="text"
          placeholder="Enter your question here..."
          className="w-full max-w-md p-2 border border-gray-300 rounded focus:outline-none focus:ring"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button
          disabled={!question || loadingContext}
          onClick={handleSubmitQuestion}
          className={`text-4xl !border-none !p-0 !bg-transparent transition ${
            !question || loadingContext
              ? '!text-gray-400 cursor-not-allowed'
              : '!text-blue-600 hover:!text-blue-700'
          }`}
        >
          <i className="bi text-4xl p-0 bi-arrow-down-square-fill"></i>
        </button>

        <textarea
          rows={8}
          className="w-full max-w-md p-3 border border-gray-300 rounded resize-none"
          placeholder="Context data will be here..."
          value={contextData}
          readOnly
        />
      </div>
    </div>
  );
};

export default Configurations;

import React, { useState } from 'react';
// import './App.css';
import './PdfViewer.css'
import 'bootstrap/dist/css/bootstrap.min.css';

import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export default function PdfViewer() {
  const [pdfFile, setPDFFile] = useState(null);
  const [viewPDF, setViewPDF] = useState(null);

  const fileType = ['application/pdf'];

  const handleChange = (e) => {
    let selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile && fileType.includes(selectedFile.type)) {
        let reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = (e) => {
          setPDFFile(e.target.result);
        };
      } else {
        setPDFFile(null);
      }
    } else {
      console.log('Please select a file');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pdfFile !== null) {
      setViewPDF(pdfFile);
    } else {
      setViewPDF(null);
    }
  };

  const newPlugin = defaultLayoutPlugin();

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <input type="file" className="form-control" onChange={handleChange} />
        <button type="submit" className="btn btn-success">
          View PDF
        </button>
      </form>

      <h2>View PDF</h2>
      <div className="pdf-container">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          {viewPDF && (
            <Viewer fileUrl={viewPDF} plugins={[newPlugin]} />
          )}
          {!viewPDF && <>No PDF</>}
        </Worker>
      </div>
    </div>
  );
}

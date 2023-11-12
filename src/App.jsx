import { Button, Upload, Input } from 'antd';
import React, { useState } from 'react';
import ReactSignatureCanvas from 'react-signature-canvas';
import PSPDFKit from 'pspdfkit'; // Import PSPDFKit library

export default function App() {
  const [pdfPreview, setPdfPreview] = useState(null);
  const [sign, setSign] = useState(null);
  const [signatureData, setSignatureData] = useState(''); // Store signature data
  const [url, setUrl] = useState('');

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPdfPreview(reader.result);
    };
  };

  const handleClear = () => {
    sign.clear();
    setUrl('');
  };

  const handleGenerate = async () => {
    const signatureImageDataUrl = sign.getTrimmedCanvas().toDataURL('image/png');
    console.log('image saved');

    // Save signature data to state
    setSignatureData(signatureImageDataUrl);

    const instance = PSPDFKit.Instance.default;

    // Assuming instance is the PSPDFKit instance
    const formFieldName = "signature";
    const formFields = await instance.getFormFields();
    const field = formFields.find(
      (formField) =>
        formField.name === formFieldName &&
        formField instanceof PSPDFKit.FormFields.SignatureFormField
    );

    const annotations = await instance.getAnnotations(0);
    const widget = annotations.find(
      (annotation) =>
        annotation instanceof PSPDFKit.Annotations.WidgetAnnotation &&
        annotation.formFieldName === field.name
    );

    const annotation = new PSPDFKit.Annotations.InkAnnotation({
      pageIndex: 0,
      lines: PSPDFKit.Immutable.List([
        // Map ReactSignatureCanvas lines to PSPDFKit DrawingPoints
        PSPDFKit.Immutable.List([
          new PSPDFKit.Geometry.DrawingPoint({
            x: widget.boundingBox.left + 5,
            y: widget.boundingBox.top + 5
          }),
          new PSPDFKit.Geometry.DrawingPoint({
            x: widget.boundingBox.left + widget.boundingBox.width - 10,
            y: widget.boundingBox.top + widget.boundingBox.height - 10
          })
        ]),
        PSPDFKit.Immutable.List([
          new PSPDFKit.Geometry.DrawingPoint({
            x: widget.boundingBox.left + widget.boundingBox.width - 10,
            y: widget.boundingBox.top + 5
          }),
          new PSPDFKit.Geometry.DrawingPoint({
            x: widget.boundingBox.left + 5,
            y: widget.boundingBox.top + widget.boundingBox.height - 10
          })
        ])
      ]),
      boundingBox: widget.boundingBox,
      isSignature: true
    });

    // Set the ink annotation image based on the signature canvas
    const imageData = await PSPDFKit.Utils.loadImage(signatureImageDataUrl);
    annotation.setImage(imageData);

    // Add the modified annotation to the PSPDFKit instance
    instance.create(annotation);

    setUrl(signatureImageDataUrl);
  };

  const handleCopyToPDF = () => {
    // Set the signature data to the PDF input field
    // You may need to adapt this part based on your PDF form field structure
    const pdfSignatureField = document.getElementById('signature');
    if (pdfSignatureField) {
      pdfSignatureField.value = signatureData;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'skyblue',
        padding: '20px',
      }}
    >
      <Upload.Dragger
        accept=".pdf"
        listType="picture"
        showUploadList={{ showRemoveIcon: false }}
        beforeUpload={(file) => {
          handleFileUpload(file);
          return false;
        }}
        style={{ backgroundColor: 'green', width: '300px' }}
      >
        <p style={{ marginBottom: '10px' }}>Drag files here or click to upload</p>
        <Button>Upload</Button>
      </Upload.Dragger>

      {pdfPreview && (
        <div style={{ marginTop: '20px', width: '100%', flexGrow: 1 }}>
          <h2>PDF Preview</h2>
          <iframe
            title="PDF Preview"
            src={pdfPreview}
            style={{ width: '100%', height: '100vh', border: '1px solid #ddd' }}
          />
        </div>
      )}

      <div style={{ border: '2px solid black', width: 500, height: 200, marginTop: '20px' }}>
        <ReactSignatureCanvas
          canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
          ref={(data) => setSign(data)}
        />
      </div>

      <Button onClick={handleClear} style={{ marginTop: '10px' }}>
        Clear
      </Button>
      <Button onClick={handleGenerate} style={{ marginTop: '10px' }}>
        Save
      </Button>

      <Input
        value={signatureData}
        readOnly
        placeholder="Signature Data"
        style={{ marginTop: '10px', width: '300px' }}
      />

      <br />
      <br />
      {url && <iframe src={url} title="Generated PDF" style={{ width: '100%', height: '500px', border: '1px solid #ddd' }} />}

      <Button onClick={handleCopyToPDF} style={{ marginTop: '10px' }}>
        Copy to PDF
      </Button>
    </div>
  );
}

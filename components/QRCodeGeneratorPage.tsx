import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Restaurant, Property, User, UserRole } from '../types';
import * as api from '../services/supabaseService';
import { qrCodeApi } from '../services/apiService';
import { LoadingSpinner } from './LoadingSpinner';
import { QRCodeSVG } from 'qrcode.react';
import { DownloadIcon, PrinterIcon } from './Icons';

interface QRCodeGeneratorPageProps {
    showToast: (message: string, type: 'success' | 'error') => void;
    currentUser: User;
}

interface QRCodeData {
    tableNumber: number;
    qrCodeUrl: string;
    qrCodeDataUrl: string | null;
}

const QRCodeGeneratorPage: React.FC<QRCodeGeneratorPageProps> = ({ showToast, currentUser }) => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [generating, setGenerating] = useState<boolean>(false);
    
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
    const [startTable, setStartTable] = useState<number>(1);
    const [endTable, setEndTable] = useState<number>(10);
    const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
    
    const isSuperAdmin = currentUser.role === UserRole.SUPERADMIN;
    const hasFetchedRef = useRef(false);

    const fetchData = useCallback(async () => {
        if (hasFetchedRef.current && loading) return;
        hasFetchedRef.current = true;
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                api.getAllRestaurants().catch(() => []),
                api.getProperties('tenant-123').catch(() => [])
            ]);
            
            if (results[0].status === 'fulfilled') {
                setRestaurants(results[0].value || []);
            }
            if (results[1].status === 'fulfilled') {
                setProperties(results[1].value || []);
            }
        } catch (error: any) {
            console.error('Failed to fetch data:', error);
            showToast('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast, loading]);

    useEffect(() => {
        hasFetchedRef.current = false;
        fetchData();
    }, [fetchData]);

    // Filter restaurants by property if not SuperAdmin
    const filteredRestaurants = isSuperAdmin
        ? restaurants
        : restaurants.filter(r => r.propertyId === currentUser.propertyId);

    const handleGenerateQRCodes = async () => {
        if (!selectedRestaurantId) {
            showToast('Please select a restaurant', 'error');
            return;
        }

        if (startTable > endTable) {
            showToast('Start table number must be less than or equal to end table number', 'error');
            return;
        }

        if (startTable < 1 || endTable > 100) {
            showToast('Table numbers must be between 1 and 100', 'error');
            return;
        }

        setGenerating(true);
        try {
            const result = await qrCodeApi.getBulkQRCodes(selectedRestaurantId, {
                startTable,
                endTable,
                format: 'both'
            });
            
            setQrCodes(result.data);
            showToast(`Generated ${result.data.length} QR codes successfully!`, 'success');
        } catch (error: any) {
            console.error('Error generating QR codes:', error);
            showToast(`Failed to generate QR codes: ${error?.message || 'Unknown error'}`, 'error');
        } finally {
            setGenerating(false);
        }
    };

    const handleDownloadQRCode = async (tableNumber: number, qrCodeUrl: string) => {
        try {
            const qrElement = document.querySelector(`#qr-${tableNumber} svg`);
            if (!qrElement) {
                showToast(`QR code for Table ${tableNumber} not found`, 'error');
                return;
            }

            // Convert SVG to canvas
            const svgData = new XMLSerializer().serializeToString(qrElement as SVGElement);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const img = new Image();
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                canvas.width = 400;
                canvas.height = 450; // Extra space for table number label
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 50, 50, 300, 300);
                
                // Add table number text
                ctx.fillStyle = 'black';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`Table ${tableNumber}`, 200, 380);

                // Download as PNG
                canvas.toBlob((blob) => {
                    if (blob) {
                        const downloadUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = downloadUrl;
                        a.download = `table-${tableNumber}-qr-code.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(downloadUrl);
                        showToast(`QR code for Table ${tableNumber} downloaded!`, 'success');
                    }
                });
                URL.revokeObjectURL(url);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                showToast(`Failed to download QR code for Table ${tableNumber}`, 'error');
            };

            img.src = url;
        } catch (error) {
            console.error('Error downloading QR code:', error);
            showToast(`Failed to download QR code for Table ${tableNumber}`, 'error');
        }
    };

    const handleDownloadAll = async () => {
        if (qrCodes.length === 0) {
            showToast('No QR codes to download', 'error');
            return;
        }

        try {
            // Use JSZip if available, otherwise download as individual files
            const downloadPromises = qrCodes.map(async (qr) => {
                const qrElement = document.querySelector(`#qr-${qr.tableNumber} svg`);
                if (!qrElement) return null;

                const svgData = new XMLSerializer().serializeToString(qrElement as SVGElement);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return null;

                return new Promise<Blob | null>((resolve) => {
                    const img = new Image();
                    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                    const url = URL.createObjectURL(svgBlob);

                    img.onload = () => {
                        canvas.width = 400;
                        canvas.height = 450;
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 50, 50, 300, 300);
                        
                        ctx.fillStyle = 'black';
                        ctx.font = 'bold 24px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(`Table ${qr.tableNumber}`, 200, 380);

                        canvas.toBlob((blob) => {
                            URL.revokeObjectURL(url);
                            resolve(blob);
                        });
                    };

                    img.onerror = () => {
                        URL.revokeObjectURL(url);
                        resolve(null);
                    };

                    img.src = url;
                });
            });

            const blobs = await Promise.all(downloadPromises);
            const validBlobs = blobs.filter((b): b is Blob => b !== null);

            // Download all as individual files (browser will prompt for each)
            validBlobs.forEach((blob, index) => {
                const qr = qrCodes[index];
                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `table-${qr.tableNumber}-qr-code.png`;
                document.body.appendChild(a);
                // Small delay between downloads
                setTimeout(() => {
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(downloadUrl);
                }, index * 100);
            });

            showToast(`Downloaded ${validBlobs.length} QR codes!`, 'success');
        } catch (error) {
            console.error('Error downloading QR codes:', error);
            showToast('Failed to download QR codes', 'error');
        }
    };

    const handlePrint = () => {
        // Add print styles
        const printStyles = document.createElement('style');
        printStyles.textContent = `
            @media print {
                body * {
                    visibility: hidden;
                }
                .qr-print-container, .qr-print-container * {
                    visibility: visible;
                }
                .qr-print-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .no-print {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(printStyles);
        window.print();
        // Remove styles after printing
        setTimeout(() => {
            document.head.removeChild(printStyles);
        }, 1000);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <>
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white;
                    }
                    .print\\:grid-cols-4 {
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                    }
                }
            `}</style>
            <div className="space-y-6">
                <div className="flex justify-between items-center no-print">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">QR Code Generator</h1>
                        <p className="text-slate-600 mt-1">Generate QR codes for table menus</p>
                    </div>
                </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 no-print">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {isSuperAdmin && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Property
                            </label>
                            <select
                                value={selectedPropertyId}
                                onChange={(e) => {
                                    setSelectedPropertyId(e.target.value);
                                    setSelectedRestaurantId(''); // Reset restaurant when property changes
                                }}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Properties</option>
                                {properties.map(prop => (
                                    <option key={prop.id} value={prop.id}>{prop.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Restaurant *
                        </label>
                        <select
                            value={selectedRestaurantId}
                            onChange={(e) => setSelectedRestaurantId(e.target.value)}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        >
                            <option value="">Select Restaurant</option>
                            {filteredRestaurants
                                .filter(r => !selectedPropertyId || r.propertyId === selectedPropertyId)
                                .map(restaurant => (
                                    <option key={restaurant.id} value={restaurant.id}>
                                        {restaurant.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Start Table
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={startTable}
                            onChange={(e) => setStartTable(parseInt(e.target.value) || 1)}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            End Table
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={endTable}
                            onChange={(e) => setEndTable(parseInt(e.target.value) || 10)}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div className="mt-4 flex gap-3">
                    <button
                        onClick={handleGenerateQRCodes}
                        disabled={generating || !selectedRestaurantId}
                        className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {generating ? 'Generating...' : 'Generate QR Codes'}
                    </button>
                    
                    {qrCodes.length > 0 && (
                        <>
                            <button
                                onClick={handleDownloadAll}
                                className="px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
                            >
                                <DownloadIcon className="w-5 h-5" />
                                Download URLs
                            </button>
                            <button
                                onClick={handlePrint}
                                className="px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
                            >
                                <PrinterIcon className="w-5 h-5" />
                                Print
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* QR Codes Display */}
            {qrCodes.length > 0 && (
                <>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 qr-print-container">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">
                            Generated QR Codes ({qrCodes.length} tables)
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {qrCodes.map((qr) => (
                                <div
                                    key={qr.tableNumber}
                                    id={`qr-${qr.tableNumber}`}
                                    className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow print:break-inside-avoid"
                                >
                                    <div className="bg-white p-3 rounded-lg mb-2">
                                        <QRCodeSVG
                                            value={qr.qrCodeUrl}
                                            size={200}
                                            level="M"
                                            includeMargin={true}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-lg text-slate-800 mb-1">
                                            Table {qr.tableNumber}
                                        </p>
                                        <div className="flex gap-2 justify-center no-print">
                                            <button
                                                onClick={() => handleDownloadQRCode(qr.tableNumber, qr.qrCodeUrl)}
                                                className="text-sm text-primary-600 hover:text-primary-700 underline"
                                                title="Download QR code"
                                            >
                                                Download
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(qr.qrCodeUrl);
                                                    showToast(`URL for Table ${qr.tableNumber} copied!`, 'success');
                                                }}
                                                className="text-sm text-slate-600 hover:text-slate-700 underline"
                                                title="Copy URL"
                                            >
                                                Copy URL
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {qrCodes.length === 0 && !generating && (
                <div className="bg-slate-50 p-8 rounded-lg text-center text-slate-600 no-print">
                    <p>Select a restaurant and table range, then click "Generate QR Codes" to get started.</p>
                </div>
            )}
            </div>
        </>
    );
};

export default QRCodeGeneratorPage;


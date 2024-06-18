// src/ImageSearch.js

import React, { useRef, useState, useEffect } from 'react';
import './ImageSearch.css';

const ImageSearch = () => {
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searched, setSearched] = useState(false); 
    const inputRef = useRef(null);

    useEffect(() => {
        if (searched) {
            searchImages();
        }
    }, [currentPage, searched]); 

    const searchImages = async () => {
        const query = inputRef.current.value;
        if (!query) {
            alert('Please enter a search term');
            return;
        }

        const apiKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
        if (!apiKey) {
            setError('API key is missing. Please check your .env file.');
            return;
        }

        const perPage = 20; // Number of images per page

        try {
            const response = await fetch(
                `https://api.unsplash.com/search/photos?query=${query}&page=${currentPage}&per_page=${perPage}&client_id=${apiKey}`
            );

            const data = await response.json();
            if (response.ok) {
                // Append new images to existing images when loading more pages
                setImages(prevImages => currentPage === 1 ? data.results : [...prevImages, ...data.results]);
                setError(null); // Clear any previous errors
            } else {
                setError('No images found. Please try a different search term.');
            }
        } catch (error) {
            console.error("Error fetching images:", error);
            setError('An error occurred while fetching the images. Please try again later.');
        }
    };

    const nextPage = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    const handleSearch = () => {
        const query = inputRef.current.value.trim();
        if (query) {
            searchImages(query, 1);
            setCurrentPage(1); 
        } else {
            setError('Please enter a search term.');
        }
    };

    const handleDownload = (imageId) => {
        // Find the image object in images array based on imageId
        const imageToDownload = images.find(image => image.id === imageId);
        if (imageToDownload) {
            // Create a temporary link element
            const downloadLink = document.createElement('a');
            downloadLink.href = imageToDownload.links.download;
            downloadLink.setAttribute('download', `${imageToDownload.id}.jpg`);
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    return (
        <div className='image-search-engine'>
            <div className='header'>Screen<span>Papers</span></div>
            <div className='search-bar'>
                <input
                    type='text'
                    ref={inputRef}
                    className='search-input'
                    placeholder='Search for images...'
                />
                <button className='search-btn' onClick={handleSearch}>Search</button>
            </div>
            {error && <div className='error-message'>{error}</div>}
            <div className='image-grid'>
                {images.map(image => (
                    <div key={image.id} className='image-item'>
                        <img src={image.urls.regular} alt={image.alt_description} />
                        <div className='image-overlay'>
                            <button className='download-btn' onClick={() => handleDownload(image.id)}>
                                Download
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {searched && (
                <div className='pagination'>
                    <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
                    <span>{currentPage}</span>
                    <button onClick={nextPage}>Next</button>
                </div>
            )}
        </div>
    );
};

export default ImageSearch;

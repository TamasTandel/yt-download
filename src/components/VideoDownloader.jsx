const handleMerge = async (videoUrl, audioUrl) => {
    try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/api/merge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ videoUrl, audioUrl })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to merge video');
        }

        // Create a blob from the stream
        const blob = await response.blob();
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `merged_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setIsLoading(false);
        setSuccess(true);
    } catch (error) {
        console.error('Download error:', error);
        setError(error.message);
        setIsLoading(false);
    }
}; 
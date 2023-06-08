import React, { useState, useEffect } from "react";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import Image  from "next/image";
import Typography from '@mui/material/Typography';

const ImageSlider = ({images}) => {
  const [currentImage, setCurrentImage] = useState("");
  const [sliderValue, setSliderValue] = useState(0);
  const [currentTimestamp, setCurrentTimestamp] = useState("");

  const timestamps = Object.keys(images).sort();
  const marks = timestamps.map((timestamp, index) => ({ value: index }));

  useEffect(() => {
    setCurrentImage(images[timestamps[sliderValue]]);
    setCurrentTimestamp(timestamps[sliderValue]);
  }, [sliderValue]);

  const handleChange = (event, newValue) => {
    setSliderValue(newValue);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    
    return date.toLocaleString();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <div sx={{ width: '100%', height: 'auto'}}>
        {currentImage && <Image src={currentImage} alt="Current image" layout="responsive" width="500px" height="300px" />}
      </div>
      <Typography sx={{ my: 2 }} variant="h6" align="center">
        {formatTimestamp(currentTimestamp)}
      </Typography>
      <Slider
        value={sliderValue}
        min={0}
        max={timestamps.length - 1}
        step={1}
        onChange={handleChange}
        valueLabelDisplay="auto"
        aria-labelledby="range-slider"
        marks={marks}
      />
    </Box>
  );
};

export default ImageSlider;

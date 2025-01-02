import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Fade,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
  Drawer,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Close,
  Fullscreen,
  FullscreenExit,
  Menu as MenuIcon,
  DragIndicator,
  PlayArrow,
  Save,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useReactFlow, ReactFlowProvider } from 'reactflow';
import useMindMapStore from '../store/mindMapStore';

const PresentationModeContent = ({ open, onClose, nodes, edges }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slides, setSlides] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [savedOrder, setSavedOrder] = useState([]);
  const { setCenter, fitView } = useReactFlow();
  const { togglePresentationMode, setPresentationOrder, setCurrentSlideIndex, startPresentation } = useMindMapStore();

  useEffect(() => {
    if (nodes.length > 0) {
      const rootNode = nodes.find(node => node.data.isRoot);
      if (!rootNode) return;

      const buildSlides = (node, depth = 0) => {
        const children = edges
          .filter(edge => edge.source === node.id)
          .map(edge => nodes.find(n => n.id === edge.target));

        return [
          { node, depth },
          ...children.flatMap(child => buildSlides(child, depth + 1))
        ];
      };

      const generatedSlides = buildSlides(rootNode);
      setSlides(generatedSlides);
      
      const savedOrderString = localStorage.getItem('presentationOrder');
      let orderToUse;

      if (savedOrderString) {
        try {
          const parsedOrder = JSON.parse(savedOrderString);
          if (Array.isArray(parsedOrder) && parsedOrder.length === generatedSlides.length) {
            orderToUse = parsedOrder;
          } else {
            orderToUse = Array.from({ length: generatedSlides.length }, (_, i) => i);
          }
        } catch {
          orderToUse = Array.from({ length: generatedSlides.length }, (_, i) => i);
        }
      } else {
        orderToUse = Array.from({ length: generatedSlides.length }, (_, i) => i);
      }

      setSavedOrder(orderToUse);
      localStorage.setItem('presentationOrder', JSON.stringify(orderToUse));
      setCurrentSlide(0);
    }
  }, [nodes, edges]);

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      const node = slides[isEditMode ? savedOrder[nextSlide] : nextSlide].node;
      setCenter(node.position.x, node.position.y, { zoom: 1.5, duration: 800 });
    }
  }, [currentSlide, slides, isEditMode, savedOrder, setCenter]);

  const handlePrev = useCallback(() => {
    if (currentSlide > 0) {
      const prevSlide = currentSlide - 1;
      setCurrentSlide(prevSlide);
      const node = slides[isEditMode ? savedOrder[prevSlide] : prevSlide].node;
      setCenter(node.position.x, node.position.y, { zoom: 1.5, duration: 800 });
    }
  }, [currentSlide, slides, isEditMode, savedOrder, setCenter]);

  const handleDragEnd = (result) => {
    if (!result.destination || !isEditMode) return;

    const newOrder = Array.from(savedOrder);
    const [movedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, movedItem);

    setSavedOrder(newOrder);
    localStorage.setItem('presentationOrder', JSON.stringify(newOrder));
  };

  const handleSaveOrder = () => {
    localStorage.setItem('presentationOrder', JSON.stringify(savedOrder));
  };

  const handleStartPresentation = () => {
    if (!slides.length || !savedOrder.length) return;

    try {
      const orderedNodeIds = savedOrder.map(index => slides[index].node.id);
      
      startPresentation(orderedNodeIds);
      
      onClose();

      requestAnimationFrame(() => {
        const firstNode = slides[savedOrder[0]].node;
        if (firstNode) {
          setCenter(firstNode.position.x, firstNode.position.y, { zoom: 2, duration: 1000 });
        }
      });
    } catch (error) {
      console.error('Sunum başlatılırken hata:', error);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowRight':
        handleNext();
        break;
      case 'ArrowLeft':
        handlePrev();
        break;
      case 'Escape':
        if (isFullscreen) {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlide]);

  if (!slides.length) return null;

  const currentNode = slides[currentSlide]?.node;
  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      sx={{ zIndex: 1000 }}
      PaperProps={{
        sx: {
          height: '90vh',
          bgcolor: 'background.default',
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1,
            display: 'flex',
            gap: 1,
          }}
        >
          <IconButton onClick={() => setIsDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <IconButton onClick={toggleFullscreen}>
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Fade key={currentSlide} in={true}>
            <Box
              sx={{
                p: 4,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 3,
                maxWidth: '80%',
                textAlign: 'center',
              }}
            >
              {currentNode?.data.type === 'image' ? (
                <img
                  src={currentNode.data.label}
                  alt="Slide Image"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    marginBottom: 16,
                  }}
                />
              ) : (
                <Typography
                  variant={currentNode?.data.isRoot ? 'h3' : 'h4'}
                  gutterBottom
                  sx={{
                    fontWeight: currentNode?.data.isRoot ? 700 : 500,
                    color: 'text.primary',
                    fontSize: currentNode?.data.style?.fontSize || 'inherit',
                    fontFamily: currentNode?.data.style?.fontFamily || 'inherit',
                    fontStyle: currentNode?.data.style?.italic ? 'italic' : 'normal',
                    fontWeight: currentNode?.data.style?.bold ? 'bold' : 'normal',
                    textDecoration: currentNode?.data.style?.underline ? 'underline' : 'none',
                  }}
                >
                  {currentNode?.data.label}
                </Typography>
              )}
            </Box>
          </Fade>

          <Box
            sx={{
              position: 'absolute',
              bottom: 32,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <IconButton
              onClick={handlePrev}
              disabled={currentSlide === 0}
              sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
            >
              <ChevronLeft />
            </IconButton>
            <Box sx={{ width: '200px' }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <IconButton
              onClick={handleNext}
              disabled={currentSlide === slides.length - 1}
              sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>

        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          PaperProps={{
            sx: { 
              width: 320,
              zIndex: 9999 
            }
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sunum Düzeni
            </Typography>
            
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveOrder}
                disabled={!isEditMode}
              >
                Sıralamayı Kaydet
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrow />}
                onClick={handleStartPresentation}
              >
                Sunumu Başlat
              </Button>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={isEditMode}
                  onChange={(e) => setIsEditMode(e.target.checked)}
                />
              }
              label="Özel Sıralama"
            />

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="slides">
                {(provided) => (
                  <List
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{ mt: 2 }}
                  >
                    {savedOrder.map((slideIndex, index) => (
                      <Draggable
                        key={`slide-${slideIndex}`}
                        draggableId={`slide-${slideIndex}`}
                        index={index}
                        isDragDisabled={!isEditMode}
                      >
                        {(provided, snapshot) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            button
                            selected={currentSlide === index}
                            onClick={() => {
                              setCurrentSlide(index);
                              const node = slides[slideIndex].node;
                              setCenter(node.position.x, node.position.y, { zoom: 1.5, duration: 800 });
                            }}
                            sx={{
                              mb: 1,
                              bgcolor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                              borderRadius: 1,
                              cursor: isEditMode ? 'grab' : 'pointer',
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            {isEditMode && (
                              <DragIndicator sx={{ mr: 1, color: 'text.secondary' }} />
                            )}
                            <ListItemText
                              primary={slides[slideIndex]?.node.data.label}
                              secondary={`Slayt ${index + 1}`}
                              primaryTypographyProps={{
                                style: {
                                  fontWeight: slides[slideIndex]?.node.data.isRoot ? 700 : 400,
                                },
                              }}
                            />
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
        </Drawer>
      </DialogContent>
    </Dialog>
  );
};

const PresentationMode = (props) => {
  if (!props.open) return null;
  
  return (
    <ReactFlowProvider>
      <PresentationModeContent {...props} />
    </ReactFlowProvider>
  );
};

export default PresentationMode; 
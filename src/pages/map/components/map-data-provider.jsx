import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import mindMapService from '../../../services/api/mindmap';
import { convertMindMapToReactFlow } from './mapUtils';
import useMindMapConverter from './mind-map-converter';

const useMapDataProvider = (mapId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mindMapData, setMindMapData] = useState(null);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [userId, setUserId] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  const saveMapFnRef = useRef(null);
  const { convertToMindMapContent } = useMindMapConverter();

  // User ID'sini localStorage'dan al
  useEffect(() => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInformation'));
      if (userInfo && userInfo.id) {
        setUserId(userInfo.id);
      }
    } catch (err) {
      console.error('User info could not be parsed', err);
    }
  }, []);

  // Save mind map changes to the API
  const saveMindMapChanges = useCallback(async (params) => {
    const { nodes: updatedNodes, edges: updatedEdges, name } = params;
    
    if (!mindMapData || !userId || saveInProgress) return;
    
    try {
      setSaveInProgress(true);
      
      // Mind map içeriğini oluştur
      const contentData = convertToMindMapContent(updatedNodes || nodes, updatedEdges || edges);
      
      // API'ye gönderilecek veriyi hazırla
      const requestData = {
        id: mindMapData.id,
        name: name || mindMapData.name,
        content: JSON.stringify(contentData),
        userId: userId,
        isPublic: mindMapData.isPublic,
        isDownloadable: mindMapData.isDownloadable,
        isCopiable: true,
        isShareable: true,
        languageId: 1 // Varsayılan dil ID'si
      };
      
      // API isteğini gönder
      const response = await mindMapService.updateMindMapByPermission(requestData);
      
      if (response && !response.error) {
        if (name && name !== mindMapData.name) {
          // İsim değişti, state'i güncelle
          setMindMapData(prev => ({ ...prev, name }));
          message.success('Harita adı güncellendi');
        }
      } else {
        console.error('Harita güncellenirken API hatası:', response?.error);
        message.error('Harita güncellenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Mind map güncellenirken hata:', err);
      message.error('Harita güncellenirken bir hata oluştu');
    } finally {
      setSaveInProgress(false);
    }
  }, [mindMapData, nodes, edges, convertToMindMapContent, userId, saveInProgress]);

  // Store the save function in a ref to avoid circular dependencies
  useEffect(() => {
    saveMapFnRef.current = saveMindMapChanges;
  }, [saveMindMapChanges]);

  // Handle name change from header
  const handleNameChange = useCallback((newName) => {
    if (newName && newName.trim() !== '' && newName !== mindMapData?.name) {
      saveMapFnRef.current?.({
        nodes, 
        edges, 
        name: newName.trim()
      });
    }
  }, [nodes, edges, mindMapData]);

  // Fetch mind map data
  const fetchMindMap = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!mapId) {
        setError('mapId yok!');
        return;
      }

      const response = await mindMapService.getMindMapById(mapId);
      if (!response || !response.data?.mindMap) {
        throw new Error('Harita bulunamadı veya geçersiz yanıt.');
      }

      const mindMap = response.data.mindMap;
      const parsedContent = JSON.parse(mindMap.content);

      // Header verisi
      setMindMapData({
        ...parsedContent,
        id: mindMap.id,
        name: mindMap.name,
        createdDate: mindMap.creationDate,
        updatedDate: mindMap.modifiedDate,
        isPublic: mindMap.isPublicMap,
        isDownloadable: mindMap.isDownloadable ?? false,
        userId: mindMap.createdBy
      });

      // Harita dönüştür
      if (parsedContent && parsedContent.root) {
        const { nodes: flowNodes, edges: flowEdges } = convertMindMapToReactFlow(
          parsedContent.root, 
          null, 
          [], 
          [], 
          { edgeStyles: parsedContent.edgeStyles || {} }
        );
        setNodes(flowNodes);
        setEdges(flowEdges);
      } else {
        setError('Harita verisi geçersiz veya boş.');
      }
    } catch (err) {
      console.error('Mind map yüklenirken hata:', err);
      setError(err.message || 'Harita yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [mapId]);

  // Load mind map when component mounts
  useEffect(() => {
    if (mapId) {
      fetchMindMap();
    } else {
      setLoading(false);
    }
  }, [mapId, fetchMindMap]);

  return {
    loading,
    error,
    mindMapData,
    saveInProgress,
    nodes,
    edges,
    saveMindMapChanges,
    handleNameChange,
    saveMapFnRef
  };
};

export default useMapDataProvider; 
import { expect, test, describe, vi } from 'vitest';
import { generateBadgePng, downloadPng } from './badge-export';

describe('badge-export', () => {
  const mockData = {
    totalTonnes: 5.0,
    totalKg: 5000,
    targetTonnes: 2.3,
    regionLabel: 'UK',
    regionAverage: 5.0,
    topCategory: 'Transport',
    topCategoryKg: 2000,
    year: 2026,
    darkMode: true,
  };

  test('generateBadgePng completely renders to a base64 data URL', () => {
    // Mock the 2D Context API to achieve branch coverage without a real DOM
    const mockContext = {
      scale: vi.fn(),
      fillRect: vi.fn(),
      createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 50 }),
    };
    
    // Mock the canvas element itself
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockContext),
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mocked_png'),
      style: {}
    } as any;
    
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') return mockCanvas;
      return document.createElement(tagName);
    });

    const result = generateBadgePng(mockData);
    
    expect(result).toBe('data:image/png;base64,mocked_png');
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(mockContext.fillText).toHaveBeenCalled(); // Ensure the render path ran
    
    createElementSpy.mockRestore();
  });
  
  test('generateBadgePng throws an error if 2d context is unavailable', () => {
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(null),
      style: {}
    } as any;
    
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas);
    
    expect(() => generateBadgePng(mockData)).toThrow('Canvas 2D context unavailable');
    
    createElementSpy.mockRestore();
  });

  test('downloadPng synthetically triggers a browser download click', () => {
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    } as any;
    
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
    
    downloadPng('data:mock', 'test-export.png');
    expect(mockAnchor.href).toBe('data:mock');
    expect(mockAnchor.download).toBe('test-export.png');
    expect(mockAnchor.click).toHaveBeenCalled();
    
    createElementSpy.mockRestore();
  });
});

/**
 * @context7-library /threewebdesigner/types
 * @description Core TypeScript type definitions for ThreeWebDesigner
 * @version 1.0.0
 * 
 * Type definitions for all API contracts, components, and workflows
 * defined in the PRDs (01_PROJECT_OVERVIEW, 02_FEATURES_AND_REQUIREMENTS)
 */

/**
 * ============================================================================
 * API REQUEST & RESPONSE TYPES
 * ============================================================================
 * From PRD 02 - Features & Requirements, Section 2.1
 */

export interface GenerateModelRequest {
  /** User's natural language description (1-5000 chars) */
  prompt: string;
  /** Model quality preference */
  quality?: 'low' | 'medium' | 'high';
  /** Model style preference */
  style?: 'realistic' | 'stylized' | 'abstract';
}

export interface GenerateModelResponse {
  /** Unique identifier for generated model */
  modelId: string;
  /** Three.js compatible model data */
  modelData: {
    format: 'glb' | 'gltf';
    data: string; // Base64 encoded
  };
  /** Model metadata and statistics */
  metadata: ModelMetadata;
  /** Suggested scroll animations */
  animations: {
    suggestions: AnimationSuggestion[];
  };
}

export interface GetModelResponse {
  modelId: string;
  prompt: string;
  modelData: {
    format: 'glb' | 'gltf';
    data: string;
  };
  metadata: ModelMetadata;
  createdAt: string;
  expiresAt: string;
}

export interface AnimationConfigRequest {
  modelId: string;
  scrollBehavior?: {
    start: string; // CSS percentage
    end: string;
  };
}

export interface AnimationConfigResponse {
  config: {
    animations: ScrollAnimation[];
  };
}

/**
 * ============================================================================
 * ERROR RESPONSE TYPE
 * ============================================================================
 */

export interface ErrorResponse {
  error: string;
  code: 'INVALID_PROMPT' | 'GENERATION_FAILED' | 'TIMEOUT' | 'RATE_LIMIT' | 'NOT_FOUND';
  suggestions?: string[];
  statusCode: number;
}

/**
 * ============================================================================
 * MODEL & METADATA TYPES
 * ============================================================================
 * From PRD 02 - Data Requirements, Section 4.1
 */

export interface ModelMetadata {
  polyCount: number;
  textureCount: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  fileSize: number; // bytes
  generationTime: number; // milliseconds
  materials: string[];
}

export interface CachedModel {
  id: string;
  prompt: string;
  modelData: {
    format: 'glb' | 'gltf';
    data: string; // Base64
  };
  metadata: ModelMetadata;
  createdAt: string;
  expiresAt: string;
}

/**
 * ============================================================================
 * ANIMATION TYPES
 * ============================================================================
 */

export interface ScrollAnimation {
  name: string;
  type: 'rotation' | 'translation' | 'scale' | 'material';
  axis?: 'x' | 'y' | 'z';
  duration: number; // milliseconds
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  intensity: number; // 0-1
  description: string;
}

export interface AnimationSuggestion extends ScrollAnimation {}

/**
 * ============================================================================
 * AI AGENT TYPES
 * ============================================================================
 * From PRD 03 - AI Agent Workflow
 */

export interface ModelSpecification {
  prompt: string;
  quality: 'low' | 'medium' | 'high';
  style: 'realistic' | 'stylized' | 'abstract';
  complexity: number; // 1-100
  targetPolyCount: number;
  timeout: number; // milliseconds
}

export interface BlenderMCPRequest {
  prompt: string;
  quality: 'low' | 'medium' | 'high';
  style: 'realistic' | 'stylized' | 'abstract';
  complexity: number;
  targetPolyCount: number;
  timeout: number;
}

export interface BlenderMCPResponse {
  modelData: ArrayBuffer;
  format: 'glb' | 'gltf';
  metadata: ModelMetadata;
}

/**
 * ============================================================================
 * UI/UX COMPONENT TYPES
 * ============================================================================
 * From PRD 04 - Frontend UI/UX, Section 3
 */

export interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: (prompt: string, options: GenerationOptions) => void;
  isLoading: boolean;
  error?: string;
  maxLength?: number;
}

export interface GenerationOptions {
  quality: 'low' | 'medium' | 'high';
  style: 'realistic' | 'stylized' | 'abstract';
}

export interface ThreeJsCanvasProps {
  modelUrl?: string;
  modelData?: {
    format: 'glb' | 'gltf';
    data: string;
  };
  isLoading: boolean;
  error?: string;
  autoRotate?: boolean;
  showGrid?: boolean;
  showLights?: boolean;
}

export interface ModelControlsProps {
  onReset: () => void;
  onRotateX: () => void;
  onRotateY: () => void;
  onDownload: () => void;
  modelInfo: {
    polyCount: number;
    textures: number;
    size: string;
  };
  disabled?: boolean;
}

export interface LoadingStateProps {
  progress?: number; // 0-100
  stage?: 'Generating' | 'Converting' | 'Optimizing';
  estimatedTime?: number; // seconds
}

export interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onSimplifyPrompt?: () => void;
}

/**
 * ============================================================================
 * INTERNAL STATE & STORE TYPES
 * ============================================================================
 */

export interface ModelState {
  currentModel: CachedModel | null;
  isGenerating: boolean;
  generationProgress: number;
  error: string | null;
  lastGeneratedPrompt: string | null;
  cacheHitCount: number;
}

export interface AppState extends ModelState {
  isMobile: boolean;
  theme: 'light' | 'dark';
  accessibility: {
    highContrast: boolean;
    reduceMotion: boolean;
  };
}

/**
 * ============================================================================
 * SUCCESS METRICS & ANALYTICS
 * ============================================================================
 * From PRD 01 - Success Metrics
 */

export interface PerformanceMetrics {
  generationTime: number; // Target: < 30 seconds
  pageLoadTime: number; // Target: < 2 seconds
  animationFps: number; // Target: 60 FPS
  fcpTime: number; // Target: < 1.5s
  lcpTime: number; // Target: < 2.5s
  cls: number; // Target: < 0.1
  lighthouseScore: number; // Target: > 90
}

export interface GenerationMetrics {
  modelId: string;
  promptHash: string;
  generationTime: number;
  cacheHit: boolean;
  modelSize: number;
  polyCount: number;
  success: boolean;
  errorCode?: string;
  timestamp: string;
}

/**
 * ============================================================================
 * VALIDATION SCHEMAS (Zod-compatible)
 * ============================================================================
 */

export const ValidationSchemas = {
  generateModelRequest: {
    prompt: { type: 'string', minLength: 1, maxLength: 5000 },
    quality: { type: 'enum', values: ['low', 'medium', 'high'], default: 'medium' },
    style: { type: 'enum', values: ['realistic', 'stylized', 'abstract'], default: 'stylized' },
  },
} as const;

/**
 * ============================================================================
 * CONSTANTS & CONFIGURATIONS
 * ============================================================================
 */

export const CONFIG = {
  // From PRD 02
  API: {
    GENERATION_TIMEOUT: 30000, // 30 seconds
    API_TIMEOUT: 100, // 100ms
    CACHE_TTL: 86400, // 24 hours
    MAX_FILE_SIZE: 52428800, // 50MB
    MAX_PROMPT_LENGTH: 5000,
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 10,
      WINDOW_MS: 60000,
    },
  },
  // From PRD 01
  PERFORMANCE_TARGETS: {
    GENERATION_TIME: 30000,
    PAGE_LOAD_TIME: 2000,
    ANIMATION_FPS: 60,
    FCP: 1500,
    LCP: 2500,
    CLS: 0.1,
    LIGHTHOUSE_SCORE: 90,
  },
  QUALITY_SETTINGS: {
    LOW: { polygons: 1000, timeout: 15000 },
    MEDIUM: { polygons: 5000, timeout: 25000 },
    HIGH: { polygons: 10000, timeout: 30000 },
  },
} as const;

/**
 * ============================================================================
 * WORKER CONTEXT TYPE
 * ============================================================================
 * For Cloudflare Worker environment
 */

export interface WorkerEnv {
  BLENDER_MCP_URL: string;
  AI_API_KEY?: string;
  MODEL_CACHE_TTL: string;
  ENABLE_DETAILED_LOGGING: string;
  MODELS_CACHE: KVNamespace;
}

export interface WorkerRequest extends Request {
  env?: WorkerEnv;
}

/**
 * ============================================================================
 * UTILITY FUNCTION TYPES
 * ============================================================================
 */

export type ModelGenerator = (spec: ModelSpecification) => Promise<BlenderMCPResponse>;
export type ModelConverter = (data: ArrayBuffer, format: string) => Promise<string>; // Base64
export type ModelValidator = (modelData: string) => Promise<{ valid: boolean; errors?: string[] }>;
export type AnimationSuggester = (metadata: ModelMetadata, prompt: string) => Promise<AnimationSuggestion[]>;

export interface ToolSet {
  generateModel: ModelGenerator;
  convertModel: ModelConverter;
  validateModel: ModelValidator;
  suggestAnimations: AnimationSuggester;
}

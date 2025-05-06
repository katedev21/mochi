// src/services/voiceCommandProcessor.js
/**
 * Voice Command Processor for handling voice commands
 * Processes natural language input to identify intent and extract entities
 */

// Intent patterns with regex for matching voice commands
const INTENT_PATTERNS = {
    SHOW_GOALS: /show (my|all)?\s?(long[- ]term|short[- ]term)? goals/i,
    SHOW_TASKS: /show (my|all)?\s?tasks/i,
    ADD_GOAL: /add (a|new)?\s?(long[- ]term|short[- ]term)? goal/i,
    UPDATE_GOAL: /update (goal|progress)/i,
    COMPLETE_TASK: /((mark|set) (as )?complete|complete)/i,
    CREATE_TASK: /(add|create) (a|new)?\s?task/i,
    GOAL_PROGRESS: /progress (for|on)/i,
    HELP: /help|what can (you|i) (do|say)/i,
    GENERATE_GOALS: /generate (short[- ]term)? goals/i
  };
  
  // Entity extraction functions
  const extractGoalType = (text) => {
    if (/(long[- ]term)/i.test(text)) return 'long-term';
    if (/(short[- ]term)/i.test(text)) return 'short-term';
    return null;
  };
  
  const extractGoalTitle = (text) => {
    // Try to find goal title patterns like "called X" or "titled X"
    const titleMatch = text.match(/(?:called|titled|named) ["'](.+?)["']/i);
    if (titleMatch && titleMatch[1]) return titleMatch[1];
    
    return null;
  };
  
  const extractPercentage = (text) => {
    const percentMatch = text.match(/(\d+)(?:\s)?(%|percent)/i);
    if (percentMatch && percentMatch[1]) return parseInt(percentMatch[1], 10);
    
    return null;
  };
  
  const extractTaskTitle = (text) => {
    // Extract task title after "task" or "called" or "titled"
    const taskMatch = text.match(/task ["'](.+?)["']/i) || 
                      text.match(/(?:called|titled|named) ["'](.+?)["']/i);
    
    if (taskMatch && taskMatch[1]) return taskMatch[1];
    
    return null;
  };
  
  /**
   * Process a voice command and determine the intent and entities
   * @param {string} command - The voice command to process
   * @returns {Object} Intent and entities extracted from the command
   */
  export const processVoiceCommand = (command) => {
    if (!command || typeof command !== 'string') {
      return { intent: null, entities: {} };
    }
    
    const normalizedCommand = command.toLowerCase().trim();
    
    // Determine intent
    let detectedIntent = null;
    Object.entries(INTENT_PATTERNS).forEach(([intent, pattern]) => {
      if (pattern.test(normalizedCommand)) {
        detectedIntent = intent;
      }
    });
    
    // Extract entities based on intent
    const entities = {};
    
    if (detectedIntent) {
      switch (detectedIntent) {
        case 'SHOW_GOALS':
          entities.goalType = extractGoalType(normalizedCommand);
          break;
        
        case 'ADD_GOAL':
          entities.goalType = extractGoalType(normalizedCommand);
          entities.title = extractGoalTitle(normalizedCommand);
          break;
        
        case 'UPDATE_GOAL':
          entities.title = extractGoalTitle(normalizedCommand);
          entities.progress = extractPercentage(normalizedCommand);
          break;
        
        case 'COMPLETE_TASK':
          entities.taskTitle = extractTaskTitle(normalizedCommand);
          break;
        
        case 'CREATE_TASK':
          entities.taskTitle = extractTaskTitle(normalizedCommand);
          break;
        
        case 'GOAL_PROGRESS':
          entities.title = extractGoalTitle(normalizedCommand);
          break;
        
        case 'GENERATE_GOALS':
          entities.goalType = extractGoalType(normalizedCommand);
          break;
        
        default:
          break;
      }
    }
    
    return {
      intent: detectedIntent,
      entities,
      originalCommand: command
    };
  };
  
  /**
   * Generate a response based on the processed command
   * @param {Object} processedCommand - The processed command with intent and entities
   * @returns {string} Response message
   */
  export const generateResponse = (processedCommand) => {
    const { intent, entities } = processedCommand;
    
    if (!intent) {
      return "I'm not sure I understand. Could you rephrase that?";
    }
    
    switch (intent) {
      case 'SHOW_GOALS':
        return `Showing your ${entities.goalType || 'all'} goals.`;
      
      case 'SHOW_TASKS':
        return "Here are your tasks.";
      
      case 'ADD_GOAL':
        return `I'll help you add a new ${entities.goalType || 'goal'}${entities.title ? ` called "${entities.title}"` : ''}.`;
      
      case 'UPDATE_GOAL':
        if (entities.title && entities.progress) {
          return `Updating goal "${entities.title}" to ${entities.progress}% progress.`;
        }
        return "Which goal would you like to update?";
      
      case 'COMPLETE_TASK':
        if (entities.taskTitle) {
          return `Marking task "${entities.taskTitle}" as complete.`;
        }
        return "Which task would you like to complete?";
      
      case 'CREATE_TASK':
        if (entities.taskTitle) {
          return `Creating new task: "${entities.taskTitle}".`;
        }
        return "What task would you like to create?";
      
      case 'GOAL_PROGRESS':
        if (entities.title) {
          return `Checking progress for "${entities.title}".`;
        }
        return "Which goal would you like to check progress on?";
      
      case 'HELP':
        return "I can help you manage your goals and tasks. You can say things like 'show my goals', 'add a new task', 'update goal progress', or 'complete task'.";
      
      case 'GENERATE_GOALS':
        return `Generating ${entities.goalType || 'short-term'} goals based on your long-term goals.`;
      
      default:
        return "I'm not sure how to help with that yet.";
    }
  };
  
  export default {
    processVoiceCommand,
    generateResponse
  };
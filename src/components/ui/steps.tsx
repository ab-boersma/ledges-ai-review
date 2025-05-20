
import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep: number;
  children: React.ReactNode;
}

export const Steps = React.forwardRef<HTMLDivElement, StepsProps>(
  ({ activeStep = 1, className, children, ...props }, ref) => {
    // Convert children to array to manipulate them
    const stepsArray = React.Children.toArray(children);
    const totalSteps = stepsArray.length;

    return (
      <div
        ref={ref}
        className={cn("flex w-full", className)}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<StepProps>, {
              stepNumber: index + 1,
              isActive: index + 1 === activeStep,
              isCompleted: index + 1 < activeStep,
              isLast: index === totalSteps - 1,
            });
          }
          return child;
        })}
      </div>
    );
  }
);
Steps.displayName = "Steps";

export interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  stepNumber?: number;
  isActive?: boolean;
  isCompleted?: boolean;
  isLast?: boolean;
}

export const Step = React.forwardRef<HTMLDivElement, StepProps>(
  ({ title, description, stepNumber, isActive, isCompleted, isLast, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-1 flex-col",
          isLast ? "" : "mr-2",
          className
        )}
        {...props}
      >
        <div className="flex items-center">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2 text-center text-sm font-semibold",
              isActive ? "border-primary bg-primary text-primary-foreground" : 
              isCompleted ? "border-green-500 bg-green-500 text-white" : 
              "border-gray-300 bg-gray-100 text-gray-500"
            )}
          >
            {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
          </div>
          {!isLast && (
            <div 
              className={cn(
                "h-1 flex-1",
                isCompleted ? "bg-green-500" : "bg-gray-200"
              )} 
            />
          )}
        </div>
        <div className="mt-2">
          <p 
            className={cn(
              "text-sm font-medium",
              isActive ? "text-primary" : 
              isCompleted ? "text-green-600" : 
              "text-gray-500"
            )}
          >
            {title}
          </p>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Step.displayName = "Step";

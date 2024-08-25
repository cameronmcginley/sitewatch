import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

export const InfoTooltip = ({ text }) => {
  const [tooltipElement, setTooltipElement] = useState(null);

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info
              size={16}
              className="inline-block ml-1"
              ref={(element) => setTooltipElement(element)}
            />
          </TooltipTrigger>
          {tooltipElement &&
            createPortal(
              <TooltipContent className="z-50">
                <p>{text}</p>
              </TooltipContent>,
              document.body
            )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

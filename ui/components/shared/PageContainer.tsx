import React, { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
};

const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return <div className="w-full max-w-5xl p-6">{children}</div>;
};

export default PageContainer;

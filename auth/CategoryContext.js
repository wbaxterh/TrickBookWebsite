import { createContext, useContext, useState } from 'react';

export const CategoryContext = createContext({
  selectedCategory: null,
  setSelectedCategory: () => {},
});

export const CategoryProvider = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  return (
    <CategoryContext.Provider value={{ selectedCategory, setSelectedCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => useContext(CategoryContext);

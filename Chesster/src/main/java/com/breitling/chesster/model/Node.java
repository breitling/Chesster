package com.breitling.chesster.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Node
{
    private String data;
    private String label;
    private String icon;
    private String expandedIcon;
    private String collapsedIcon;
    private Boolean leaf;
    private Node [] children;
    
    public Node()
    {
        this.expandedIcon = "pi pi-folder-open";
        this.collapsedIcon = "pi pi-folder";
        this.leaf = true;
        this.children = new Node[0];
    }
    
//  CONSTRUCTOR FOR DELETE ENDPOINT
    
    public Node(String data) {
        this();
        this.data = data;
    }
    
//  FACTORIES
    
    public static Node create() {
        return new Node();
    }
    
    public static Node create(String data, String name) 
    {
        Node n = Node.create();
        
        n.setData(data.replaceAll("\\\\", "/"));
        n.setLabel(name);
        
        return n;
    }
    
//  GETTERS AND SETTERS
    
    public String getData() {
        return data;
    }
    
    public void setData(String data) {
        this.data = data;
    }
    
    public String getLabel() {
        return label;
    }
    
    public void setLabel(String label) {
        this.label = label;
    }

    public Boolean getLeaf() {
        return leaf;
    }

    public void setLeaf(Boolean children) {
        this.leaf = children;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getExpandedIcon() {
        return expandedIcon;
    }

    public void setExpandedIcon(String expandedIcon) {
        this.expandedIcon = expandedIcon;
    }

    public String getCollapsedIcon() {
        return collapsedIcon;
    }

    public void setCollapsedIcon(String collapsedIcon) {
        this.collapsedIcon = collapsedIcon;
    }

    public Node[] getChildren() {
        return children;
    }

    public void setChildren(Node[] children) {
        this.children = children;
    }
}

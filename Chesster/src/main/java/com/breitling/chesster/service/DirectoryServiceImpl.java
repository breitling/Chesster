package com.breitling.chesster.service;

import java.io.File;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.breitling.chesster.model.Node;
import com.breitling.jclib.service.FileService;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class DirectoryServiceImpl implements DirectoryService 
{
	private static final Logger LOG = LoggerFactory.getLogger(DirectoryServiceImpl.class);
    
	private ObjectMapper mapper = new ObjectMapper();
    
	@Autowired
	private FileService service;
	
//  CONTRACT METHODS

	@Override
	public Boolean databaseExists(String name)
	{
		return service.databaseExists(name);
	} 
	
	@Override
    public Boolean exists(String path) 
    {
		return service.exists(path);
    } 
    
	@Override
    public String getFiles(String location)
    {
    	String json = "[ ]";
    	
        LOG.debug("Location = {}", location);
        
        final List<Node> nodes = new ArrayList<>();
        
        try
        {
            File [] list = Paths.get(location).toFile().listFiles();
            
            for (File f : list)
            {
                var name = f.getName();
                
                if (filterNames(name))
                	continue;
                
                Node node = Node.create(f.getPath(), name);
                
                if (f.isDirectory())
                {
                    node.setLeaf(false);
                    node.setIcon("pi pi-folder");
                }
                else
                {
                    node.setIcon("pi pi-file");
                }
                
                nodes.add(node);
            }
            
            json = mapper.writeValueAsString(nodes);
        }
        catch (Exception e)
        {
            LOG.error("Tree failure: {}", e.getMessage());
        }
    	
    	return json;
    }
    
//  PRIVATE METHODS
    
    private boolean filterNames(String name)
    {
        if (name != null &&
           (name.equals(".DS_Store") ||
            name.equals("$Recycle.Bin") || 
            name.equals("$RECYCLE.BIN") ||
            name.equals("Thumbs.db") ||
            name.startsWith("NTUSER.DAT") || 
            name.startsWith("ntuser.dat") ||
            name.startsWith(".")))
        {
            LOG.debug("filtering out {}", name);
            return true;
        }

        return false;
    }       
}

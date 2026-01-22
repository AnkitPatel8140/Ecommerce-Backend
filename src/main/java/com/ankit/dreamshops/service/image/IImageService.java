package com.ankit.dreamshops.service.image;

import com.ankit.dreamshops.DTO.ImageDto;
import com.ankit.dreamshops.model.Image;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IImageService {
    Image getImageById(Long id);
    void deleteImageById(Long id);
    List<ImageDto> saveImages(List<MultipartFile> files, Long productId);
    Image updateImage(MultipartFile file, Long imageId);

}

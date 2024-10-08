import { PartialType } from '@nestjs/swagger';
import { CreateArticleDto } from './create-article.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
    
    @IsNotEmpty({
        message: 'ID is required'
    })
    id: number;
}

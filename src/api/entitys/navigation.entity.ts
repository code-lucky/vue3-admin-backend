import { BaseEntity } from "src/base-entity/BaseEntity";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('navigation')
export class Navigation extends BaseEntity {

    @PrimaryColumn()
    id: number;

    @Column({
        comment: '导航名称',
    })
    name: string;

    @Column({
        comment: '导航路径',
    })
    path: string;

    @Column({
        comment: '导航父ID',
        default: 0
    })
    pid: number;

    @Column({
        comment: '导航图标',
    })
    icon: string;
    
}
